import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductService } from 'src/product/product.service';
import { CommonService } from 'src/common/common.service';
import { Product } from 'src/product/entities/product.entity';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { VariantsService } from '../variants.service';
import { Variant } from '../entities/variant.entity';

describe('VariantsService', () => {
  let variantsService: VariantsService;

  const mockVariantRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((dto) => {
      return {
        id: '1',
        ...dto,
      };
    }),
    findOne: jest.fn().mockImplementation((id) => {
      return {
        id,
        company: 'company',
        productId: '1',
      };
    }),
    findOneBy: jest.fn().mockImplementation((id) => {
      if (!id.id) {
        return undefined;
      } else {
        return {
          ...id,
          company: 'company',
          product: {
            id: '1',
            stock: 3,
          },
          stock: 3,
          value: 40.5,
        };
      }
    }),
    findAndCount: jest.fn().mockImplementation((dto) => {
      return [[], 0];
    }),
    createQueryBuilder: jest.fn().mockImplementation(() => ({
      where: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockReturnValue([]),
      getManyAndCount: jest.fn().mockReturnValue([[], 0]),
    })),
    preload: jest.fn().mockImplementation((dto) => {
      return {
        ...dto,
        company: 'company',
        productId: '1',
        stock: 3,
        value: 40.5,
      };
    }),
    remove: jest.fn().mockImplementation((dto) => {
      return {};
    }),
  };

  const mockProductRepository = {
    save: jest.fn().mockImplementation((dto) => {
      return {
        id: '1',
        ...dto,
      };
    }),
  };

  const mockProductService = {
    getById: jest.fn().mockImplementation((id) => {
      return {
        id,
        stock: 3,
      };
    }),
  };
  const mockCommonService = {
    getNextPrev: jest.fn().mockImplementation((dto, count, type) => {
      return { pages: 0, prev: null, next: null, variants: [] };
    }),
  };
  // const mockConfigService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VariantsService,
        ConfigService,
        {
          provide: getRepositoryToken(Variant),
          useValue: mockVariantRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: ProductService,
          useValue: mockProductService,
        },
        {
          provide: CommonService,
          useValue: mockCommonService,
        },
        // {
        //   provide: ConfigService,
        //   useValue: mockConfigService,
        // },
      ],
    }).compile();

    variantsService = module.get<VariantsService>(VariantsService);
  });

  it('should be defined', () => {
    expect(variantsService).toBeDefined();
  });

  describe('insert', () => {
    it('should insert a variant', async () => {
      const variant = {
        company: 'company',
        productId: '1',
        stock: 3,
        value: 40.5,
      };

      const variantRes = {
        company: variant.company,
        name: expect.any(String),
        originalValue: variant.value,
        stock: variant.stock,
        product: {
          id: '1',
          averagePrice: variant.value,
          stock: 6,
        },
        value: variant.value,
      };

      const response = await variantsService.insert(variant);

      expect(response).toEqual(variantRes);
      expect(mockVariantRepository.save).toHaveBeenCalledWith(variantRes);
    });
  });

  describe('getAll', () => {
    it('should return a list of variants', async () => {
      const createQueryBuilder: any = {
        where: () => createQueryBuilder,
        leftJoinAndSelect: () => createQueryBuilder,
        getMany: () => [],
      };
      const response = await variantsService.getAll({ page: 1, limit: 10 });
      expect(response).toEqual({
        variants: [],
        pages: 0,
        prev: null,
        next: null,
      });
    });
  });

  describe('getById', () => {
    it('should return a variant', async () => {
      const variant = {
        id: '1',
        company: 'company',
        productId: '1',
        stock: 3,
        value: 40.5,
      };

      const response = await variantsService.getById('1');

      expect(response).toEqual({
        id: variant.id,
        company: variant.company,
        stock: variant.stock,
        value: variant.value,
        product: {
          id: '1',
          stock: 3,
        },
      });
      expect(mockVariantRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });
    it('should return an error when no variant is found', async () => {
      await expect(variantsService.getById(null)).rejects.toEqual(
        new NotFoundException(`Variante con id null no encontrado`),
      );
    });
  });

  describe('getAllByIds', () => {
    it('should return a list of variants', async () => {
      const response = await variantsService.getAllByIds([]);
      expect(response).toEqual([]);
    });
    it('should return an error when no variants are found', async () => {
      await expect(variantsService.getAllByIds(['1', '2'])).rejects.toEqual(
        new NotFoundException(`Al menos una de las variantes no se encontro`),
      );
    });
  });

  describe('update', () => {
    it('should update a variant', async () => {
      const variant = {
        id: '1',
        company: 'company',
        productId: '1',
        value: 40.5,
        stock: 3,
      };

      const variantRes = {
        id: '1',
        company: variant.company,
        productId: variant.productId,
        value: variant.value,
        stock: 3,
      };

      const response = await variantsService.update(variant.id, variant);

      expect(response).toEqual(variantRes);
      expect(mockVariantRepository.save).toHaveBeenCalledWith(variantRes);
    });
  });

  describe('delete', () => {
    it('should delete a variant', async () => {
      const variant = {
        id: '1',
        company: 'company',
        productId: '1',
        stock: 3,
        value: 40.5,
      };

      const response = await variantsService.delete(variant.id);

      expect(response).toEqual(`Variante con id 1 eliminado`);
      expect(mockVariantRepository.findOneBy).toHaveBeenCalledWith({
        id: '1',
      });
      expect(mockVariantRepository.remove).toHaveBeenCalled();
    });
  });

  describe('udpateStock', () => {
    it('should update a variant stock', async () => {
      const variant = {
        id: '1',
        company: 'company',
        productId: '1',
        stock: 3,
        value: 40.5,
      };

      const response = await variantsService.updateStock(variant.id, 3);

      expect(response).toEqual(undefined);
      expect(mockVariantRepository.findOneBy).toHaveBeenCalledWith({
        id: '1',
      });
      expect(mockVariantRepository.save).toHaveBeenCalled();
    });
  });
});
