import { QueryRunner } from 'typeorm';
import { BaseSeed } from './seed.interface';
import {
  AccuracyEval,
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
      let accuracyDetail = '';
      let logicDetail = '';
      let depthDetail = '';
      let keywords: string[] = [];

      const accuracyEval = isHighScore
        ? AccuracyEval.PERFECT
        : AccuracyEval.GOOD;
      const logicEval = isHighScore ? LogicEval.FLAWLESS : LogicEval.WEAK;
      const depthEval = isHighScore ? DepthEval.EXPERT : DepthEval.BASIC;

      if (sub.question_title.includes('작업 실행 단위')) {
        feedback = isHighScore
          ? '프로세스와 스레드의 자원 공유 방식을 아주 정확하게 설명하셨습니다.'
          : '기본적인 정의는 맞으나 멀티 스레드의 동기화 문제에 대한 언급이 부족합니다.';
        accuracyDetail = '독립된 메모리 영역과 공유 영역의 구분이 명확함';
        logicDetail = '비교 분석의 흐름이 논리적임';
        depthDetail = 'Context Switching 오버헤드 관점의 설명 포함';
        keywords = ['Process', 'Thread', 'Context Switching', 'IPC'];
      } else if (sub.question_title.includes('웹 페이지 로딩')) {
        feedback = isHighScore
          ? '네트워크 핸드셰이크부터 브라우저의 렌더링 파이프라인까지 전체 과정을 잘 요약했습니다.'
          : '렌더링 과정은 잘 설명하셨으나 네트워크 단계(DNS, TCP) 설명이 다소 생략되었습니다.';
        accuracyDetail =
          'DNS 조회 및 레이아웃/페인트 과정의 기술적 정확도 높음';
        logicDetail = '순차적 발생 과정을 시간순으로 잘 배정함';
        depthDetail = 'Reflow/Repaint 최적화 관점의 인사이트 포함';
        keywords = ['Browser Rendering', 'DOM', 'CSSOM', 'DNS', 'TCP'];
      } else {
        feedback = '준수한 답변입니다.';
        keywords = ['Technical Interview'];
      }

      const detailAnalysis = JSON.stringify({
        accuracy: accuracyDetail || '핵심 개념을 잘 파악하고 있습니다.',
        logic: logicDetail || '서론-본론-결론의 구조가 명확합니다.',
        depth: depthDetail || '실무적인 적용 사례까지 언급하면 더 좋겠습니다.',
      }).replace(/'/g, "''");

      const scoreDetails = JSON.stringify({
        accuracy: Math.floor(sub.score * 0.4),
        logic: Math.floor(sub.score * 0.3),
        depth: sub.score - Math.floor(sub.score * 0.7),
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
        '${accuracyEval}',
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
        accuracy_eval,
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
