import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import {
  QuizMode,
  InputType,
  ProcessStatus,
} from '../answer-submission.constants';
import { Question } from '../../question/entities/question.entity';
import { AudioAsset } from '../../audio-stream/entities/audio-asset.entity';
import { EvaluationStatus } from '../../answer-evaluation/answer-evaluation.constants';

@Entity('answer_submissions')
class AnswerSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'quiz_mode', type: 'enum', enum: QuizMode })
  quizMode: QuizMode;

  @Column({ name: 'input_type', type: 'enum', enum: InputType })
  inputType: InputType;

  @Column({ name: 'raw_answer', type: 'text' })
  rawAnswer: string;

  @Column({
    name: 'self_importance_rating',
    type: 'float',
    nullable: true,
  })
  selfImportanceRating: number;

  @Column({ name: 'taken_time', type: 'int' })
  takenTime: number;

  @Column({ type: 'int', default: 0 })
  score: number;

  @CreateDateColumn({ name: 'submitted_at', type: 'timestamp' })
  submittedAt: Date;

  @Column({
    name: 'stt_status',
    type: 'enum',
    enum: ProcessStatus,
    default: ProcessStatus.PENDING,
  })
  sttStatus: ProcessStatus;

  @Column({
    name: 'evaluation_status',
    type: 'enum',
    enum: EvaluationStatus,
    default: EvaluationStatus.PENDING,
  })
  evaluationStatus: EvaluationStatus;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'question_id', type: 'int' })
  questionId: number;

  @Column({ name: 'audio_asset_id', type: 'int', unique: true, nullable: true })
  audioAssetId: number | null;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @OneToOne(() => AudioAsset, { nullable: true })
  @JoinColumn({ name: 'audio_asset_id' })
  audioAsset: AudioAsset | null;
}

export { AnswerSubmission };
