/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';

const mockCategoryRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
};

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryRepository: Repository<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategoryTreeByRootName', () => {
    it('루트 이름으로 카테고리 트리를 조회해야 한다', async () => {
      const rootName = '프론트엔드';
      const mockCategory = {
        id: 1,
        name: rootName,
        depth: 1,
        children: [],
      } as unknown as Category;

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);

      const result = await service.getCategoryTreeByRootName(rootName);

      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { name: rootName, depth: 1 },
        relations: ['children', 'children.questions'],
        order: { children: { name: 'ASC' } },
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('getRootCategories', () => {
    it('depth 1인 루트 카테고리 목록을 조회해야 한다', async () => {
      const mockCategories = [
        { id: 1, name: '프론트엔드', depth: 1 },
        { id: 2, name: '백엔드', depth: 1 },
      ] as unknown as Category[];

      mockCategoryRepository.find.mockResolvedValue(mockCategories);

      const result = await service.getRootCategories();

      expect(categoryRepository.find).toHaveBeenCalledWith({
        where: { depth: 1 },
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getCategoryTreeById', () => {
    it('ID로 카테고리 트리(하위 포함)를 조회해야 한다', async () => {
      const id = 5;
      const mockCategory = {
        id,
        name: 'React',
        depth: 2,
        children: [],
      } as unknown as Category;

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);

      const result = await service.getCategoryTreeById(id);

      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['children'],
        order: { children: { name: 'ASC' } },
      });
      expect(result).toEqual(mockCategory);
    });
  });
});
