import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import {
  AccuracyEval,
  LogicEval,
  DepthEval,
} from '../answer-evaluation.constants';
import { AnswerSubmission } from '../../answer-submission/entities/answer-submission.entity';

@Entity('answer_evaluations')
export class AnswerEvaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'submission_id', type: 'int' })
  submissionId: number;

  @Column({ name: 'feedback_message', type: 'text', nullable: true })
  feedbackMessage: string | null;

  @Column({ name: 'detail_analysis', type: 'jsonb', nullable: true })
  detailAnalysis: {
    accuracy: string;
    logic: string;
    depth: string;
  } | null;

  @Column({ name: 'score_details', type: 'jsonb', nullable: true })
  scoreDetails: {
    accuracy: number;
    logic: number;
    depth: number;
    completeness: number;
    application: number;
  } | null;

  @Column({
    name: 'accuracy_eval',
    type: 'enum',
    enum: AccuracyEval,
    nullable: true,
  })
  accuracyEval: AccuracyEval | null;

  @Column({ name: 'logic_eval', type: 'enum', enum: LogicEval, nullable: true })
  logicEval: LogicEval | null;

  @Column({ name: 'depth_eval', type: 'enum', enum: DepthEval, nullable: true })
  depthEval: DepthEval | null;

  @Column({ name: 'has_application', type: 'boolean', default: false })
  hasApplication: boolean;

  @Column({ name: 'is_complete_sentence', type: 'boolean', default: false })
  isCompleteSentence: boolean;

  @Column({
    name: 'extracted_keywords',
    type: 'text',
    array: true,
    default: '{}',
  })
  extractedKeywords: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToOne(() => AnswerSubmission)
  @JoinColumn({ name: 'submission_id' })
  submission: AnswerSubmission;
}
