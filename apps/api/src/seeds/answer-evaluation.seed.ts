import { QueryRunner } from 'typeorm';
import { BaseSeed } from './seed.interface';
import {
  AccuracyEval,
  LogicEval,
  DepthEval,
} from '../answer-evaluation/answer-evaluation.constants';
import { EvaluationStatus } from '../answer-evaluation/answer-evaluation.constants';

interface SubmissionRow {
  id: number;
  evaluation_status: EvaluationStatus;
  question_title: string; // 질문 제목을 통해 피드백을 구분하기 위해 추가
  score: number; // 점수에 따라 피드백 퀄리티를 다르게 하기 위해 추가
}

export class AnswerEvaluationSeed extends BaseSeed {
  name = 'AnswerEvaluationSeed';
  environment: 'development' | 'production' | 'both' = 'development';

  async run(queryRunner: QueryRunner): Promise<void> {
    // 1. 이미 데이터가 있으면 스킵
    const result = (await queryRunner.query(
      `SELECT COUNT(*) as count FROM answer_evaluations`,
    )) as Array<{ count: string }>;

    if (parseInt(result[0].count) > 0) {
      console.log('AnswerEvaluations already exist, skipping...');
      return;
    }

    // 2. Submission과 Question 정보를 조인하여 조회
    // (평가가 완료된 COMPLETED 상태인 것만 가져옵니다)
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

    // 3. 질문 및 점수에 따른 동적 피드백 생성기
    const generateEvaluation = (sub: SubmissionRow) => {
      const isHighScore = sub.score >= 80;

      // 공통 변수
      let feedback = '';
      let accuracyDetail = '';
      let logicDetail = '';
      let depthDetail = '';
      let keywords: string[] = [];

      const accuracyEval = isHighScore
        ? AccuracyEval.PERFECT
        : AccuracyEval.MINOR_ERROR;
      const logicEval = isHighScore ? LogicEval.CLEAR : LogicEval.WEAK;
      const depthEval = isHighScore ? DepthEval.DEEP : DepthEval.BASIC;

      // 질문별 분기 처리
      if (sub.question_title.includes('HTTP')) {
        feedback = isHighScore
          ? 'HTTP와 HTTPS의 보안 차이점과 포트 번호까지 정확하게 언급하셨습니다.'
          : '기본적인 암호화 유무는 설명하셨으나, 기술적 근거가 부족합니다.';
        accuracyDetail = isHighScore
          ? 'TLS/SSL의 역할을 명확히 이해하고 있습니다.'
          : 'HTTPS가 보안에 강하다는 점은 맞지만 기술적 근거가 부족합니다.';
        logicDetail = '보안 프로토콜의 필요성을 논리적으로 설명함';
        depthDetail = '포트 번호 및 인증서 구조 언급';
        keywords = isHighScore
          ? ['HTTP', 'HTTPS', 'TLS', 'SSL', 'Handshake', '포트 443']
          : ['HTTP', 'HTTPS', '암호화'];
      } else if (sub.question_title.includes('REST')) {
        feedback = isHighScore
          ? 'REST의 4가지 원칙과 HATEOAS까지 훌륭하게 설명했습니다.'
          : 'HTTP 메서드와 자원의 개념은 알고 계시지만, Stateless 특징에 대한 언급이 없습니다.';
        accuracyDetail = '자원 식별 및 API 엔드포인트 설계 개념 정확';
        logicDetail = isHighScore
          ? '아키텍처 스타일의 장단점을 논리적으로 전개했습니다.'
          : '정의만 나열되어 있고 흐름이 다소 끊깁니다.';
        keywords = isHighScore
          ? ['REST', 'HATEOAS', 'Stateless', 'Self-descriptive', 'Resource']
          : ['REST API', 'HTTP Method', 'URI'];
      } else if (sub.question_title.includes('React')) {
        feedback = isHighScore
          ? 'Reconciliation 과정과 Diff 알고리즘의 시간 복잡도 최적화 원리를 잘 짚어주셨습니다.'
          : '가상 돔의 개념은 맞지만, 실제로 왜 빠른지에 대한 설명이 아쉽습니다.';
        depthDetail = isHighScore
          ? 'Fiber 아키텍처와 Batching 업데이트 개념 포함'
          : '단순한 DOM 조작 오버헤드만 언급';
        keywords = isHighScore
          ? ['React', 'Virtual DOM', 'Reconciliation', 'Fiber', 'Diffing']
          : ['React', 'Virtual DOM', 'Component'];
      } else {
        keywords = ['기술 면접', '기초 개념'];
      }

      // JSON 필드 생성 (엔티티 필드와 1:1 매칭)
      const detailAnalysis = JSON.stringify({
        accuracy: accuracyDetail || '핵심 개념을 잘 파악하고 있습니다.',
        logic: logicDetail || '서론-본론-결론의 구조가 명확합니다.',
        depth: depthDetail || '실무적인 적용 사례까지 언급하면 더 좋겠습니다.',
      }).replace(/'/g, "''");

      // 점수 상세 가중치 배분 (합계가 sub.score가 되도록 구성)
      const scoreDetails = JSON.stringify({
        accuracy: Math.floor(sub.score * 0.35),
        logic: Math.floor(sub.score * 0.3),
        depth: Math.floor(sub.score * 0.25),
        completeness: Math.floor(sub.score * 0.05),
        application: sub.score - Math.floor(sub.score * 0.95), // 나머지
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
        ${isHighScore ? 'true' : 'false'},
        ${isHighScore ? 'true' : 'false'},
        ${keywordsSql}
      )`;
    };

    // 4. VALUES 구문 생성
    const values = submissions.map(generateEvaluation).join(',\n');

    // 5. 데이터 삽입 실행
    await queryRunner.query(`
      INSERT INTO answer_evaluations (
        submission_id,
        feedback_message,
        detail_analysis,
        score_details,
        accuracy_eval,
        logic_eval,
        depth_eval,
        has_application,
        is_complete_sentence,
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
