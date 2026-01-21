import { QueryRunner } from 'typeorm';
import { BaseSeed } from './seed.interface';
import {
  QuizMode,
  InputType,
  ProcessStatus,
} from '../answer-submission/answer-submission.constants';
import { EvaluationStatus } from '../answer-evaluation/answer-evaluation.constants';

interface QuestionRow {
  id: number;
  title: string;
}

interface SubmissionData {
  quiz_mode: QuizMode;
  input_type: InputType;
  raw_answer: string;
  taken_time: number;
  score: number;
  stt_status: ProcessStatus;
  evaluation_status: EvaluationStatus;
  user_id: number;
  question_id: number;
  audio_asset_id: string;
}

export class AnswerSubmissionSeed extends BaseSeed {
  name = 'AnswerSubmissionSeed';
  environment: 'development' | 'production' | 'both' = 'development';

  async run(queryRunner: QueryRunner): Promise<void> {
    // 1. 이미 데이터가 있으면 날리기 (QuestionSeed에서 이미 삭제했겠지만 안전을 위해)
    await queryRunner.query(`DELETE FROM answer_submissions`);

    // 2. Question ID 조회
    const questions = (await queryRunner.query(`
      SELECT id, title FROM questions;
    `)) as QuestionRow[];

    const getQuestionId = (title: string): number | undefined =>
      questions.find((q) => q.title === title)?.id;

    const osId = getQuestionId('작업 실행 단위의 이해');
    const browserId = getQuestionId('웹 페이지 로딩의 여정');

    if (!osId && !browserId) {
      console.log(
        'Required questions not found, skipping AnswerSubmissionSeed...',
      );
      return;
    }

    const submissions: SubmissionData[] = [];

    if (osId) {
      submissions.push({
        quiz_mode: QuizMode.DAILY,
        input_type: InputType.TEXT,
        raw_answer:
          '프로세스는 운영체제로부터 할당받는 작업의 단위이고, 스레드는 프로세스 내에서 실행되는 흐름의 단위입니다. 멀티 프로세스는 독립적이라 안정적이지만 자원 소모가 크고, 멀티 스레드는 자원을 공유해 효율적이나 동기화 이슈가 있습니다.',
        taken_time: 45,
        score: 85,
        stt_status: ProcessStatus.DONE,
        evaluation_status: EvaluationStatus.COMPLETED,
        user_id: 1,
        question_id: osId,
        audio_asset_id: 'NULL',
      });
    }

    if (browserId) {
      submissions.push({
        quiz_mode: QuizMode.DAILY,
        input_type: InputType.TEXT,
        raw_answer:
          '사용자가 URL을 입력하면 DNS 조회를 통해 IP를 얻고 서버와 핸드셰이크를 합니다. HTML을 받아 DOM 트리를 만들고 CSS로 CSSOM을 만든 뒤 렌더 트리를 결합하여 화면에 레이아웃과 페인트를 수행합니다.',
        taken_time: 60,
        score: 90,
        stt_status: ProcessStatus.DONE,
        evaluation_status: EvaluationStatus.COMPLETED,
        user_id: 1,
        question_id: browserId,
        audio_asset_id: 'NULL',
      });
    }

    if (submissions.length === 0) return;

    // 4. SQL 생성 및 실행
    const valuesQuery = submissions
      .map(
        (sub) => `(
        '${sub.quiz_mode}',
        '${sub.input_type}',
        '${sub.raw_answer.replace(/'/g, "''")}',
        ${sub.taken_time},
        ${sub.score},
        '${sub.stt_status}',
        '${sub.evaluation_status}',
        ${sub.user_id},
        ${sub.question_id},
        ${sub.audio_asset_id}
      )`,
      )
      .join(',');

    await queryRunner.query(`
      INSERT INTO answer_submissions (
        quiz_mode,
        input_type,
        raw_answer,
        taken_time,
        score,
        stt_status,
        evaluation_status,
        user_id,
        question_id,
        audio_asset_id
      )
      VALUES ${valuesQuery};
    `);

    console.log(
      `✅ Seeded ${submissions.length} answer_submissions successfully.`,
    );
  }
}
