import { QueryRunner } from 'typeorm';
import { BaseSeed } from './seed.interface';
import { NodeType } from '../graph/graph.constants';

interface QuestionRow {
  id: number;
  title: string;
}

interface GraphNodeRow {
  id: number;
  type: NodeType;
  label: string;
}

/**
 * 그래프 목데이터 시딩
 * QUESTION 노드 3개, KEYWORD 노드 4개, 그리고 연결 관계를 생성한다
 */
export class GraphSeed extends BaseSeed {
  name = 'GraphSeed';
  environment: 'development' | 'production' | 'both' = 'development';

  async run(queryRunner: QueryRunner): Promise<void> {
    // 개발 환경에서는 기존 데이터 삭제 (재시딩 가능하도록)
    console.log('Cleaning existing graph data...');
    await queryRunner.query(`DELETE FROM graph_edges`);
    await queryRunner.query(`DELETE FROM graph_nodes`);

    // 기본 사용자 조회 또는 생성 (GraphNode는 사용자별로 관리됨)
    let users = (await queryRunner.query(
      `SELECT id FROM users ORDER BY id LIMIT 1`,
    )) as Array<{ id: number }>;

    // 사용자가 없으면 임시 사용자 생성
    if (users.length === 0) {
      await queryRunner.query(
        `INSERT INTO users (email, nickname, password, role, total_point, total_score)
         VALUES ('seed@example.com', 'Seed User', 'temp', 'USER', 0, 0)`,
      );
      users = (await queryRunner.query(
        `SELECT id FROM users ORDER BY id LIMIT 1`,
      )) as Array<{ id: number }>;
    }

    const userId = users[0].id;

    // 기존 questions 테이블에서 React 관련 질문 조회
    // "React의 Virtual DOM" 질문을 활용하거나, 없으면 새로 생성
    const reactQuestions = (await queryRunner.query(`
      SELECT id, title FROM questions 
      WHERE title LIKE '%React%' OR title LIKE '%Virtual DOM%'
      ORDER BY id
      LIMIT 3;
    `)) as QuestionRow[];

    // 필요한 질문이 부족하면 기존 질문을 활용하거나 새로 생성
    // 여기서는 기존 질문을 최대한 활용하되, 요청된 구조에 맞게 조정
    let questionIds: number[] = [];

    // React 관련 질문을 기반으로 하되, 부족하면 다른 질문으로 채움
    questionIds = reactQuestions.map((q) => q.id);

    // 3개 미만이면 다른 질문으로 채움
    if (questionIds.length < 3) {
      const allQuestions = (await queryRunner.query(`
        SELECT id, title FROM questions ORDER BY id;
      `)) as QuestionRow[];

      if (allQuestions.length === 0) {
        throw new Error(
          'Questions must be seeded before GraphSeed. Please run QuestionSeed first.',
        );
      }

      // 기존 questionIds에 없는 질문으로 채움
      for (const q of allQuestions) {
        if (questionIds.length >= 3) break;
        if (!questionIds.includes(q.id)) {
          questionIds.push(q.id);
        }
      }

      // 여전히 부족하면 경고만 출력 (중복 ID 사용 방지)
      if (questionIds.length < 3) {
        console.warn(
          `Warning: Only ${questionIds.length} unique questions available. Creating graph with ${questionIds.length} question nodes instead of 3.`,
        );
      }
    }

    // 요청된 구조에 맞게 질문 라벨 설정
    // 실제로는 기존 질문을 활용하되, 라벨만 요청된 형식으로 설정
    const questionLabelsToUse = [
      'React란 무엇인가요?',
      'Virtual DOM의 동작 원리는?',
      'useState와 useEffect 차이점은?',
    ];

    // QUESTION 노드 생성 (요청된 구조에 맞게 라벨 설정)
    for (
      let i = 0;
      i < questionIds.length && i < questionLabelsToUse.length;
      i++
    ) {
      await queryRunner.query(
        `INSERT INTO graph_nodes (user_id, type, label, question_id) VALUES ($1, 'QUESTION', $2, $3) RETURNING id`,
        [userId, questionLabelsToUse[i], questionIds[i]],
      );
    }

    // 생성된 QUESTION 노드 조회
    const questionNodes = (await queryRunner.query(
      `SELECT id, type, label FROM graph_nodes WHERE user_id = $1 AND type = 'QUESTION' ORDER BY id`,
      [userId],
    )) as GraphNodeRow[];

    // KEYWORD 노드 생성 (label 기준 유니크)
    const keywords = ['React', 'Virtual DOM', '컴포넌트', 'Hook'];

    for (const keyword of keywords) {
      // 이미 존재하는지 확인 (유니크 제약 조건: user_id + type + label)
      const existing = (await queryRunner.query(
        `SELECT id FROM graph_nodes WHERE user_id = $1 AND type = 'KEYWORD' AND label = $2`,
        [userId, keyword],
      )) as Array<{ id: number }>;

      if (existing.length === 0) {
        await queryRunner.query(
          `INSERT INTO graph_nodes (user_id, type, label, question_id) VALUES ($1, 'KEYWORD', $2, NULL) RETURNING id`,
          [userId, keyword],
        );
      }
    }

    // 생성된 KEYWORD 노드 조회
    const keywordNodes = (await queryRunner.query(
      `SELECT id, type, label FROM graph_nodes WHERE user_id = $1 AND type = 'KEYWORD' ORDER BY label`,
      [userId],
    )) as GraphNodeRow[];

    // 키워드 매핑 함수
    const getKeywordId = (label: string): number | undefined =>
      keywordNodes.find((k) => k.label === label)?.id;

    const reactKeywordId = getKeywordId('React');
    const virtualDomKeywordId = getKeywordId('Virtual DOM');
    const componentKeywordId = getKeywordId('컴포넌트');
    const hookKeywordId = getKeywordId('Hook');

    if (
      !reactKeywordId ||
      !virtualDomKeywordId ||
      !componentKeywordId ||
      !hookKeywordId
    ) {
      throw new Error('Failed to create keyword nodes');
    }

    // QUESTION 노드 매핑
    const question1Id = questionNodes[0]?.id; // "React란 무엇인가요?"
    const question2Id = questionNodes[1]?.id; // "Virtual DOM의 동작 원리는?"
    const question3Id = questionNodes[2]?.id; // "useState와 useEffect 차이점은?"

    if (!question1Id) {
      throw new Error(
        'Failed to create question nodes - at least one question is required',
      );
    }

    // 엣지 생성 (방향 없는 연결)
    // 요청된 구조:
    // 1. React란 무엇인가요? <-> React
    // 2. React란 무엇인가요? <-> Virtual DOM
    // 3. Virtual DOM의 동작 원리는? <-> Virtual DOM (question2가 있을 때만)
    // 4. React란 무엇인가요? <-> 컴포넌트
    // 5. useState와 useEffect 차이점은? <-> Hook (question3가 있을 때만)
    // 6. useState와 useEffect 차이점은? <-> React (question3가 있을 때만)

    const edges: Array<{ sourceId: number; targetId: number }> = [
      { sourceId: question1Id, targetId: reactKeywordId },
      { sourceId: question1Id, targetId: virtualDomKeywordId },
      { sourceId: question1Id, targetId: componentKeywordId },
    ];

    // 질문 2가 있으면 추가
    if (question2Id) {
      edges.push({ sourceId: question2Id, targetId: virtualDomKeywordId });
    }

    // 질문 3이 있으면 추가
    if (question3Id) {
      edges.push({ sourceId: question3Id, targetId: hookKeywordId });
      edges.push({ sourceId: question3Id, targetId: reactKeywordId });
    }

    // 중복 방지를 위해 기존 엣지 확인 후 삽입
    for (const edge of edges) {
      // sourceId와 targetId의 순서를 정규화 (작은 ID가 sourceId)
      const [sourceId, targetId] =
        edge.sourceId < edge.targetId
          ? [edge.sourceId, edge.targetId]
          : [edge.targetId, edge.sourceId];

      const existing = (await queryRunner.query(
        `SELECT id FROM graph_edges WHERE user_id = $1 AND source_id = $2 AND target_id = $3`,
        [userId, sourceId, targetId],
      )) as Array<{ id: number }>;

      if (existing.length === 0) {
        await queryRunner.query(
          `INSERT INTO graph_edges (user_id, source_id, target_id) VALUES ($1, $2, $3)`,
          [userId, sourceId, targetId],
        );
      }
    }

    console.log(
      `Created ${questionNodes.length} question nodes, ${keywordNodes.length} keyword nodes, and ${edges.length} edges`,
    );
  }
}
