import { Test, TestingModule } from '@nestjs/testing';
import { SellerController } from '../seller.controller';
import { SellerService } from '../seller.service';

describe('SellerController', () => {
  let controller: SellerController;
  const seller = {
    firstName: 'test',
    lastName: 'test',
    email: 'test@test.com',
    company: 'test',
    products: [],
  };
  const sellerLogged = {
    id: '1',
    ...seller,
    orders: [],
    password: ' ',
    isActive: true,
    emailToLowerCase: undefined,
    checkBeforeUpdate: undefined,
  };
  const mockSellerService = {
    findAll: jest.fn().mockImplementation(() => {
      return [];
    }),
    findOne: jest.fn().mockImplementation((id) => {
      return {
        ...seller,
        id,
      };
    }),
    update: jest.fn().mockImplementation((id, dto, sellerToUpdate) => {
      return {
        id,
        orders: sellerToUpdate.orders,
        ...dto,
      };
    }),
    remove: jest.fn().mockImplementation((id) => {
      return `Vendedor con id ${id} ahora está inactivo`;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerController],
      providers: [SellerService],
    })
      .overrideProvider(SellerService)
      .useValue(mockSellerService)
      .compile();

    controller = module.get<SellerController>(SellerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should findAll Sellers', () => {
    const dto = { page: 1 };
    expect(controller.findAll(dto)).toEqual([]);
    expect(mockSellerService.findAll).toHaveBeenCalledWith(dto);
  });

  it('should findOne Seller', () => {
    expect(controller.findOne('1')).toEqual({ ...seller, id: '1' });
    expect(mockSellerService.findOne).toHaveBeenCalledWith('1');
  });

  it('should update Seller', () => {
    const dto = {
      firstName: 'test',
      lastName: 'test',
      email: '',
    };

    expect(controller.update('1', dto, sellerLogged)).toEqual({
      id: '1',
      orders: sellerLogged.orders,
      ...dto,
    });
    expect(mockSellerService.update).toHaveBeenCalledWith(
      '1',
      dto,
      sellerLogged,
    );
  });

  it('should delete Seller', () => {
    expect(controller.remove('1')).toEqual(
      `Vendedor con id 1 ahora está inactivo`,
    );
    expect(mockSellerService.remove).toHaveBeenCalledWith('1');
  });
});
