import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';
import { VariantsController } from '../variants.controller';
import { VariantsService } from '../variants.service';

describe('VariantsController', () => {
  let controller: VariantsController;

  const mockVariantsService = {
    insert: jest.fn((dto) => {
      return {
        ...dto,
        id: uuid(),
      };
    }),
    getAll: jest.fn().mockImplementation((dto) => {
      return [];
    }),
    getById: jest.fn().mockImplementation((id) => {
      return {
        id,
        company: 'company',
        productId: '1',
        stock: 3,
        value: 40.5,
      };
    }),
    update: jest.fn().mockImplementation((id, dto) => {
      return {
        ...dto,
        id,
      };
    }),
    delete: jest.fn().mockImplementation((id) => {
      return {};
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VariantsController],
      providers: [VariantsService],
    })
      .overrideProvider(VariantsService)
      .useValue(mockVariantsService)
      .compile();

    controller = module.get<VariantsController>(VariantsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a variant', () => {
    const dto = {
      company: 'company',
      productId: '1',
      stock: 3,
      value: 40.5,
    };
    expect(controller.insert(dto)).toEqual({
      ...dto,
      id: expect.any(String),
    });

    expect(mockVariantsService.insert).toHaveBeenCalledWith(dto);
  });

  it('should find all variants', () => {
    expect(controller.getAll({ page: 1 })).toEqual([]);
    expect(mockVariantsService.getAll).toHaveBeenCalledWith({ page: 1 });
  });

  it('should find a variant by its id', () => {
    const dto = {
      company: 'company',
      productId: '1',
      stock: 3,
      value: 40.5,
    };
    expect(controller.getById('1')).toEqual({
      ...dto,
      id: '1',
    });

    expect(mockVariantsService.getById).toHaveBeenCalledWith('1');
  });

  it('should update a variant', () => {
    const dto = {
      company: 'company',
      productId: '1',
      stock: 3,
      value: 40.5,
    };
    expect(controller.update('1', dto)).toEqual({
      ...dto,
      id: '1',
    });

    expect(mockVariantsService.update).toHaveBeenCalledWith('1', dto);
  });

  it('should delete a variant', () => {
    expect(controller.delete('1')).toEqual({});
    expect(mockVariantsService.delete).toHaveBeenCalledWith('1');
  });
});
