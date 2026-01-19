import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { QuestionFilterDto } from './dtos/question-filter.dto';
import { PaginatedQuestionsDto } from './dtos/paginated-questions.dto';

@Injectable()
export class QuestionService {
  private readonly pageSize = 15;

  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
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
      relations: ['category'],
    });
  }

  async findPaginated(
    filter: QuestionFilterDto,
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

    queryBuilder
      .orderBy('question.avgImportance', 'DESC')
      .skip(skip)
      .take(this.pageSize);

    const [questions, totalCount] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(totalCount / this.pageSize);

    return {
      questions,
      totalCount,
      pageSize: this.pageSize,
      currentPage: page,
      totalPages,
    };
  }
}
