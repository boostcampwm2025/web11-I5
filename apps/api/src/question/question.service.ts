import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnswerSubmission } from 'src/answer-submission/entities/answer-submission.entity';
import { Repository } from 'typeorm';
import { PaginatedQuestionsDto } from './dtos/paginated-questions.dto';
import { QuestionFilterDto } from './dtos/question-filter.dto';
import { Question } from './entities/question.entity';
import { SolvedStatus } from './question.constants';

@Injectable()
export class QuestionService {
  private readonly pageSize = 15;

  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(AnswerSubmission)
    private answerSubmissionRepository: Repository<AnswerSubmission>,
  ) {}

  async findByCategory(categoryId: number) {
    return await this.questionRepository.find({
      where: { category: { id: categoryId } },
      order: { avgImportance: 'DESC' }, // 중요도 순 정렬
    });
  }

  async findOneById(questionId: number) {
    return this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['category', 'category.parent'],
    });
  }

  async findPaginated(
    filter: QuestionFilterDto,
    userId?: number,
  ): Promise<PaginatedQuestionsDto> {
    const page = filter.page ?? 1;
    const skip = (page - 1) * this.pageSize;

    const queryBuilder = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.category', 'category')
      .leftJoinAndSelect('category.parent', 'parentCategory');

    if (filter.categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', {
        categoryId: filter.categoryId,
      });
    } else if (filter.parentCategoryId) {
      queryBuilder.andWhere('parentCategory.id = :parentCategoryId', {
        parentCategoryId: filter.parentCategoryId,
      });
    }

    if (filter.search) {
      queryBuilder.andWhere('question.title LIKE :search', {
        search: `%${filter.search}%`,
      });
    }

    if (filter.minImportance !== undefined) {
      queryBuilder.andWhere('question.avgImportance >= :minImportance', {
        minImportance: filter.minImportance,
      });
    }

    queryBuilder
      .orderBy('question.avgImportance', 'DESC')
      .skip(skip)
      .take(this.pageSize);

    const [questions, totalCount] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(totalCount / this.pageSize);

    // userId가 있으면 해당 사용자의 점수를 조회하여 매핑
    let questionsWithScore: (Question & { score: number | null })[] =
      questions.map((q) => ({ ...q, score: null }));

    if (userId && filter.solvedStatus) {
      console.log(userId);
      const questionsIds = questions.map((question) => question.id);
      const submissions = await this.answerSubmissionRepository
        .createQueryBuilder('submission')
        .select('submission.questionId', 'questionId')
        .addSelect('MAX(submission.score)', 'maxScore')
        .where('submission.userId = :userId', { userId })
        .andWhere('submission.questionId IN (:...questionIds)', {
          questionIds: questionsIds,
        })
        .groupBy('submission.questionId')
        .getRawMany<{ questionId: number; maxScore: number }>();

      const scoreMap = new Map(
        submissions.map((submission) => [
          submission.questionId,
          submission.maxScore,
        ]),
      );

      questionsWithScore = questions.map((question) => ({
        ...question,
        score: scoreMap.get(question.id) ?? null,
      }));

      if (filter.solvedStatus === SolvedStatus.SOLVED) {
        questionsWithScore = questionsWithScore.filter((q) => q.score !== null);
      } else if (filter.solvedStatus === SolvedStatus.UNSOLVED) {
        questionsWithScore = questionsWithScore.filter((q) => q.score === null);
      }
    }

    return {
      questions: questionsWithScore,
      totalCount,
      pageSize: this.pageSize,
      currentPage: page,
      totalPages,
    };
  }
}
