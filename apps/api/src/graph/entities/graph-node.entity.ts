import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { NodeType } from '../graph.constants';
import { Question } from '../../question/entities/question.entity';

/**
 * 그래프 노드 Entity
 * QUESTION 또는 KEYWORD 타입의 노드를 표현한다
 * 사용자별로 독립적인 그래프 구조를 관리한다
 */
@Entity('graph_nodes')
@Index(['userId', 'type', 'label'], {
  unique: true,
  where: `type = 'KEYWORD'`,
})
@Index(['userId', 'type', 'questionId'], {
  unique: true,
  where: `type = 'QUESTION'`,
})
export class GraphNode {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 노드를 소유한 사용자 ID
   */
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  /**
   * 노드 타입 (QUESTION 또는 KEYWORD)
   */
  @Column({ type: 'enum', enum: NodeType })
  type: NodeType;

  /**
   * 노드 라벨 (표시용 텍스트)
   * QUESTION 타입: 문제 제목
   * KEYWORD 타입: 키워드 텍스트 (사용자별로 유니크)
   */
  @Column({ type: 'varchar', length: 255 })
  label: string;

  /**
   * QUESTION 타입인 경우 연결된 question_id
   * KEYWORD 타입인 경우 null
   */
  @Column({ name: 'question_id', type: 'int', nullable: true })
  questionId: number | null;

  /**
   * QUESTION 노드와 questions 테이블 간 관계
   */
  @ManyToOne(() => Question, { nullable: true })
  @JoinColumn({ name: 'question_id' })
  question: Question | null;
}
