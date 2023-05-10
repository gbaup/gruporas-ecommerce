import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '../order.controller';
import { OrderService } from '../order.service';

describe('OrdersController', () => {
  let controller: OrderController;

  const mockOrdersService = {
    insert: jest.fn((dto, user) => {
      return {
        user: user,
        seller: undefined,
        detalles: undefined,
      };
    }),
    findAll: jest.fn((dto, user) => {
      return [[], null, null, 0];
    }),
    getById: jest.fn((id, user) => {
      return {
        id: id,
        user: user,
        seller: undefined,
        detalles: undefined,
      };
    }),
    update: jest.fn((user, id, dto) => {
      return {
        user: user,
        seller: undefined,
        detalles: undefined,
      };
    }),
    delete: jest.fn((user, id) => {
      return {};
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [OrderService],
    })
      .overrideProvider(OrderService)
      .useValue(mockOrdersService)
      .compile();
    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a order', () => {
    const dto = {
      variants: [],
    };
    const user = {
      id: '123',
      email: 'test@hola.com',
      password: '123',
      rol: 'user',
      order: undefined,
      firstName: 'test',
      lastName: 'test',
      adress: 'test',
      emailToLowerCase: undefined,
      isActive: true,
      checkBeforeUpdate: undefined,
    };
    expect(controller.create(dto, user)).toEqual({
      seller: undefined,
      detalles: undefined,
      user: user,
    });
    expect(mockOrdersService.insert).toHaveBeenCalledWith(dto, user);
  });

  it('should be find all orders', () => {
    const user = {
      id: '123',
      email: 'test@hola.com',
      password: '123',
      rol: 'user',
      order: undefined,
      firstName: 'test',
      lastName: 'test',
      adress: 'test',
      emailToLowerCase: undefined,
      isActive: true,
      checkBeforeUpdate: undefined,
    };
    const dto = {
      page: 0,
    };
    expect(controller.findAll(user, dto)).toEqual([[], null, null, 0]);
    expect(mockOrdersService.findAll).toHaveBeenCalledWith(user, dto);
  });

  it('should find order by id', () => {
    const id = '123';
    const user = {
      id: '123',
      email: 'test@hola.com',
      password: '123',
      rol: 'user',
      order: undefined,
      firstName: 'test',
      lastName: 'test',
      adress: 'test',
      emailToLowerCase: undefined,
      isActive: true,
      checkBeforeUpdate: undefined,
    };
    expect(controller.findOne(id, user)).toEqual({
      id: id,
      user: user,
      seller: undefined,
      detalles: undefined,
    });
    expect(mockOrdersService.getById).toHaveBeenCalledWith(id, user);
  });

  it('should update a order', () => {
    const id = '123';
    const dto = {
      status: undefined,
    };
    const user = {
      id: '123',
      email: 'test@hola.com',
      password: '123',
      rol: 'user',
      order: undefined,
      firstName: 'test',
      lastName: 'test',
      adress: 'test',
      emailToLowerCase: undefined,
      isActive: true,
      checkBeforeUpdate: undefined,
    };
    expect(controller.update(user, id, dto)).toEqual({
      user: user,
      seller: undefined,
      detalles: undefined,
      status: undefined,
    });
    expect(mockOrdersService.update).toHaveBeenCalledWith(user, id, dto);
  });

  it('should delete a order', () => {
    const id = '123';
    const user = {
      id: '123',
      email: 'test@hola.com',
      password: '123',
      rol: 'user',
      order: undefined,
      firstName: 'test',
      lastName: 'test',
      adress: 'test',
      emailToLowerCase: undefined,
      isActive: true,
      checkBeforeUpdate: undefined,
    };
    expect(controller.remove(user, id)).toEqual({});
    expect(mockOrdersService.delete).toHaveBeenCalledWith(user, id);
  });
});
