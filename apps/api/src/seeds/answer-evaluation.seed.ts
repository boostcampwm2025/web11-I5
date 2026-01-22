import { QueryRunner } from 'typeorm';
import { BaseSeed } from './seed.interface';
import {
  CoreConceptEval,
  CoverageEval,
  LogicEval,
  DepthEval,
  EvaluationStatus,
} from '../answer-evaluation/answer-evaluation.constants';

interface SubmissionRow {
  id: number;
  evaluation_status: EvaluationStatus;
  question_title: string;
  score: number;
}

export class AnswerEvaluationSeed extends BaseSeed {
  name = 'AnswerEvaluationSeed';
  environment: 'development' | 'production' | 'both' = 'development';

  async run(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM answer_evaluations`);

    const submissions = (await queryRunner.query(`
      SELECT 
        s.id, 
        s.evaluation_status, 
        s.score,
        q.title as question_title
      FROM answer_submissions s
      JOIN questions q ON s.question_id = q.id
      WHERE s.evaluation_status = '${EvaluationStatus.COMPLETED}'
      ORDER BY s.id ASC;
    `)) as SubmissionRow[];

    if (submissions.length === 0) {
      console.log(
        'No COMPLETED submissions found, skipping AnswerEvaluationSeed...',
      );
      return;
    }

    const generateEvaluation = (sub: SubmissionRow) => {
      const isHighScore = sub.score >= 80;

      let feedback = '';
      let coreConceptDetail = '';
      let coverageDetail = '';
      let logicDetail = '';
      let depthDetail = '';
      let keywords: string[] = [];

      const coreConceptEval = isHighScore
        ? CoreConceptEval.CORRECT
        : CoreConceptEval.MINOR_ERROR;
      const coverageEval = isHighScore
        ? CoverageEval.COMPLETE
        : CoverageEval.ADEQUATE;
      const logicEval = isHighScore ? LogicEval.CLEAR : LogicEval.WEAK;
      const depthEval = isHighScore ? DepthEval.ADVANCED : DepthEval.BASIC;

      if (sub.question_title.includes('작업 실행 단위')) {
        feedback = isHighScore
          ? '프로세스와 스레드의 자원 공유 방식을 아주 정확하게 설명하셨습니다.'
          : '기본적인 정의는 맞으나 멀티 스레드의 동기화 문제에 대한 언급이 부족합니다.';
        coreConceptDetail = '핵심 개념이 정확하게 이해됨';
        coverageDetail = '독립된 메모리 영역과 공유 영역의 구분이 명확함';
        logicDetail = '비교 분석의 흐름이 논리적임';
        depthDetail = 'Context Switching 오버헤드 관점의 설명 포함';
        keywords = ['Process', 'Thread', 'Context Switching', 'IPC'];
      } else if (sub.question_title.includes('웹 페이지 로딩')) {
        feedback = isHighScore
          ? '네트워크 핸드셰이크부터 브라우저의 렌더링 파이프라인까지 전체 과정을 잘 요약했습니다.'
          : '렌더링 과정은 잘 설명하셨으나 네트워크 단계(DNS, TCP) 설명이 다소 생략되었습니다.';
        coreConceptDetail = '기술적 정확도가 높음';
        coverageDetail = 'DNS 조회 및 레이아웃/페인트 과정의 주요 내용 포함';
        logicDetail = '순차적 발생 과정을 시간순으로 잘 배정함';
        depthDetail = 'Reflow/Repaint 최적화 관점의 인사이트 포함';
        keywords = ['Browser Rendering', 'DOM', 'CSSOM', 'DNS', 'TCP'];
      } else {
        feedback = '준수한 답변입니다.';
        keywords = ['Technical Interview'];
      }

      const detailAnalysis = JSON.stringify({
        coreConcept: coreConceptDetail || '핵심 개념을 잘 파악하고 있습니다.',
        coverage: coverageDetail || '주요 내용을 적절히 포함했습니다.',
        logic: logicDetail || '서론-본론-결론의 구조가 명확합니다.',
        depth: depthDetail || '실무적인 적용 사례까지 언급하면 더 좋겠습니다.',
      }).replace(/'/g, "''");

      const scoreDetails = JSON.stringify({
        coreConcept: Math.floor(sub.score * 0.5),
        coverage: Math.floor(sub.score * 0.2),
        logic: Math.floor(sub.score * 0.1),
        depth: Math.floor(sub.score * 0.2),
      }).replace(/'/g, "''");

      const keywordsSql =
        keywords.length > 0
          ? `ARRAY[${keywords.map((k) => `'${k.replace(/'/g, "''")}'`).join(', ')}]`
          : "'{}'::text[]";

      return `(
        ${sub.id},
        '${feedback.replace(/'/g, "''")}',
        '${detailAnalysis}',
        '${scoreDetails}',
        '${coreConceptEval}',
        '${coverageEval}',
        '${logicEval}',
        '${depthEval}',
        ${keywordsSql}
      )`;
    };

    const values = submissions.map(generateEvaluation).join(',\n');

    await queryRunner.query(`
      INSERT INTO answer_evaluations (
        submission_id,
        feedback_message,
        detail_analysis,
        score_details,
        core_concept_eval,
        coverage_eval,
        logic_eval,
        depth_eval,
        extracted_keywords
      )
      VALUES
      ${values};
    `);

    console.log(
      `✅ Seeded ${submissions.length} answer_evaluations successfully.`,
    );
  }
}
