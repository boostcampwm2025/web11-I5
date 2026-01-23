import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import {
  CoreConceptEval,
  CoverageEval,
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
    coreConcept: string;
    coverage: string;
    logic: string;
    depth: string;
  } | null;

  @Column({ name: 'score_details', type: 'jsonb', nullable: true })
  scoreDetails: {
    coreConcept: number;
    coverage: number;
    logic: number;
    depth: number;
  } | null;

  @Column({
    name: 'core_concept_eval',
    type: 'enum',
    enum: CoreConceptEval,
    nullable: true,
  })
  coreConceptEval: CoreConceptEval | null;

  @Column({
    name: 'coverage_eval',
    type: 'enum',
    enum: CoverageEval,
    nullable: true,
  })
  coverageEval: CoverageEval | null;

  @Column({ name: 'logic_eval', type: 'enum', enum: LogicEval, nullable: true })
  logicEval: LogicEval | null;

  @Column({ name: 'depth_eval', type: 'enum', enum: DepthEval, nullable: true })
  depthEval: DepthEval | null;

  @Column({
    name: 'has_application',
    type: 'boolean',
    default: false,
    nullable: true,
  })
  hasApplication: boolean | null;

  @Column({
    name: 'is_complete_sentence',
    type: 'boolean',
    default: false,
    nullable: true,
  })
  isCompleteSentence: boolean | null;

  @Column({
    name: 'extracted_keywords',
    type: 'text',
    array: true,
    default: '{}',
  })
  extractedKeywords: string[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @OneToOne(() => AnswerSubmission)
  @JoinColumn({ name: 'submission_id' })
  submission: AnswerSubmission;
}
