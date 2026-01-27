import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnswerSubmission } from 'src/answer-submission/entities/answer-submission.entity';
import { AnswerSubmissionService } from 'src/answer-submission/answer-submission.service';
import { EvaluationStatus } from 'src/answer-evaluation/answer-evaluation.constants';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { OtherSubmissionDetailDto } from './dtos/other-submission-detail.dto';
import { PaginatedOtherSubmissionsDto } from './dtos/paginated-other-submissions.dto';
import { PaginatedQuestionsDto } from './dtos/paginated-questions.dto';
import { QuestionFilterDto } from './dtos/question-filter.dto';
import { Question } from './entities/question.entity';
import { SolvedStatus } from './question.constants';

interface OtherSubmissionRaw {
  submissionId: number;
  nickname: string;
  totalScore: number;
  submittedAt: Date;
}

@Injectable()
export class QuestionService {
  private readonly pageSize = 15;

  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(AnswerSubmission)
    private answerSubmissionRepository: Repository<AnswerSubmission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly answerSubmissionService: AnswerSubmissionService,
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
    const questionsIds = questions.map((question) => question.id);
    if (userId && questionsIds.length > 0) {
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

  /**
   * 특정 문제에 대한 다른 사용자들의 제출 리스트 조회 (본인 제외)
   * @param questionId 문제 ID
   * @param currentUserId 현재 사용자 ID (본인 제외용)
   * @param page 페이지 번호 (기본값: 1)
   * @param size 페이지 크기 (기본값: 10)
   * @returns 페이징된 다른 사용자 제출 리스트
   */
  async findOtherSubmissions(
    questionId: number,
    currentUserId: number,
    page: number = 1,
    size: number = 10,
  ): Promise<PaginatedOtherSubmissionsDto> {
    const skip = (page - 1) * size;

    // 문제 존재 여부 확인
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    // 다른 사용자들의 제출 리스트 조회 (본인 제외, 총점 내림차순)
    const baseQueryBuilder = this.answerSubmissionRepository
      .createQueryBuilder('submission')
      // AnswerSubmission.userId와 users.id 기준 조인
      .innerJoin('users', 'user', 'user.id = submission.userId')
      .where('submission.questionId = :questionId', { questionId })
      .andWhere('submission.userId != :currentUserId', { currentUserId })
      .andWhere('submission.evaluationStatus = :status', {
        status: EvaluationStatus.COMPLETED,
      });

    // 카운트 쿼리 (select 적용 전에 clone)
    const countQueryBuilder = baseQueryBuilder.clone();

    // // 데이터 조회용 쿼리
    const dataQueryBuilder = baseQueryBuilder
      .select('submission.id', 'submissionId')
      .addSelect('user.nickname', 'nickname')
      .addSelect('submission.score', 'totalScore')
      .addSelect('submission.submittedAt', 'submittedAt')
      .orderBy('submission.score', 'DESC')
      .addOrderBy('submission.submittedAt', 'DESC')
      .skip(skip)
      .take(size);

    const [results, totalCount] = await Promise.all([
      dataQueryBuilder.getRawMany<OtherSubmissionRaw>(),
      countQueryBuilder.getCount(),
    ]);

    const totalPages = Math.ceil(totalCount / size);

    return {
      submissions: results.map((result) => ({
        submissionId: result.submissionId,
        nickname: result.nickname,
        totalScore: result.totalScore,
        submittedAt: result.submittedAt,
      })),
      totalCount,
      pageSize: size,
      currentPage: page,
      totalPages,
    };
  }

  /**
   * 특정 문제에 대한 타 유저 제출 상세 조회
   * - 본인 제출이 아니어야 하고
   * - questionId 와 submission.questionId 가 일치해야 합니다.
   */
  async findOtherSubmissionDetail(
    questionId: number,
    submissionId: number,
    currentUserId: number,
  ): Promise<OtherSubmissionDetailDto> {
    // 제출 엔티티 조회 (본인 제출 제외)
    const submission =
      await this.answerSubmissionService.getSubmissionForOtherUser(
        submissionId,
        currentUserId,
      );

    // 다른 문제에 대한 제출이면 404
    if (submission.questionId !== questionId) {
      throw new NotFoundException(
        `Question ${questionId} 에 대한 제출 내역을 찾을 수 없습니다.`,
      );
    }

    // 문제 존재 여부 2차 확인 (삭제된 경우 방지)
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });
    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    // 작성자 닉네임 조회
    const user = await this.userRepository.findOne({
      where: { id: submission.userId },
    });
    const nickname = user?.nickname ?? '알 수 없는 사용자';

    return {
      nickname,
      submission: {
        id: submission.id,
        questionId: submission.questionId,
        submittedAt: submission.submittedAt,
        audioAssetId: submission.audioAssetId,
        evaluationStatus: submission.evaluationStatus,
        sttStatus: submission.sttStatus,
        inputType: submission.inputType,
        answerContent: submission.rawAnswer,
        totalScore: submission.score,
        duration: submission.takenTime,
      },
    };
  }
}
