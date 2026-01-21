import { QueryRunner } from 'typeorm';
import { BaseSeed } from './seed.interface';

interface CategoryRow {
  id: number;
  name: string;
}

interface QuestionData {
  title: string;
  content: string;
  avgImportance: number;
  categoryName: string;
}

const questionData: QuestionData[] = [
  {
    title: '작업 실행 단위의 이해',
    content:
      '프로세스와 스레드의 차이점을 설명하고 멀티 스레드와 멀티 프로세스의 장단점을 비교해주세요.',
    avgImportance: 4.9,
    categoryName: 'Operating System',
  },
  {
    title: '웹 페이지 로딩의 여정',
    content:
      '브라우저 주소창에 www.google.com을 입력하고 엔터를 쳤을 때, 화면이 렌더링되기까지의 과정을 네트워크와 브라우저 렌더링 관점에서 설명해주세요.',
    avgImportance: 4.7,
    categoryName: 'Browser Rendering',
  },
];

export class QuestionSeed extends BaseSeed {
  name = 'QuestionSeed';
  environment: 'development' | 'production' | 'both' = 'both';

  async run(queryRunner: QueryRunner): Promise<void> {
    // 기존 데이터를 날리기 위해 DELETE 수행 (FK 관계 보존을 위한 순차 삭제)
    await queryRunner.query(`DELETE FROM graph_edges`);
    await queryRunner.query(`DELETE FROM graph_nodes`);
    await queryRunner.query(`DELETE FROM question_solutions`);
    await queryRunner.query(`DELETE FROM answer_evaluations`);
    await queryRunner.query(`DELETE FROM answer_submissions`);
    await queryRunner.query(`DELETE FROM questions`);

    const categories = (await queryRunner.query(`
      SELECT id, name FROM categories WHERE depth = 2;
    `)) as CategoryRow[];

    const getCategoryId = (name: string): number | undefined =>
      categories.find((c) => c.name === name)?.id;

    const values = questionData
      .map((q) => {
        const categoryId = getCategoryId(q.categoryName);
        if (!categoryId) {
          console.warn(`Category not found: ${q.categoryName}`);
          return null;
        }
        const escapedTitle = q.title.replace(/'/g, "''");
        const escapedContent = q.content.replace(/'/g, "''");
        return `('${escapedTitle}', '${escapedContent}', NULL, 0, ${q.avgImportance}, ${categoryId})`;
      })
      .filter(Boolean)
      .join(',\n        ');

    if (values) {
      await queryRunner.query(`
        INSERT INTO questions (
          title,
          content,
          tts_url,
          avg_score,
          avg_importance,
          category_id
        )
        VALUES
          ${values};
      `);
    }

    console.log(`Inserted ${questionData.length} questions`);
  }
}
