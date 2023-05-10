import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { SellerService } from 'src/seller/seller.service';
import { UserService } from 'src/user/user.service';
import { VariantsService } from 'src/variants/variants.service';
import { Detalle } from '../entities/detail.entity';
import { Order } from '../entities/order.entity';
import { OrderService } from '../order.service';
import { v4 as uuid } from 'uuid';
import { User } from 'src/user/entities/user.entity';
import { Seller } from 'src/seller/entities/seller.entity';
import { PaginationInput } from 'src/common/dto/pagination.dto';
import { count } from 'console';
import { NotFoundException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrderService;

  const user: User = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'asd',
    adress: '123 Main St',
    rol: 'user',
    isActive: true,
    emailToLowerCase: function () {
      return this.email.toLowerCase();
    },
    checkBeforeUpdate: function () {
      return true;
    },
    order: [],
  };
  const seller = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'asd',
    company: '123 Main St',
    isActive: true,
    rol: 'seller',
    emailToLowerCase: function () {
      return this.email.toLowerCase();
    },
    checkBeforeUpdate: function () {
      return true;
    },
    orders: [],
    products: [],
  };

  const order: Order = {
    id: '123',
    user: user,
    seller: seller,
    detalles: [],
  };

  const sellerTest = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'asd',
    company: '123 Main St',
    isActive: true,
    type: 'seller',
    emailToLowerCase: function () {
      return this.email.toLowerCase();
    },
    checkBeforeUpdate: function () {
      return true;
    },
    orders: [],
    products: [],
  };

  const mockOrderRepository = {
    create: jest.fn().mockImplementation((dto) => {
      return {
        detalles: [],
        id: '123',
        seller: {},
        user: {},
      };
    }),
    save: jest.fn().mockImplementation((dto) => {
      return {
        id: '123',
        ...dto,
      };
    }),
    findAndCount: jest.fn().mockImplementation((dto: PaginationInput) => {
      return [[Order], count];
    }),
    preload: jest.fn().mockImplementation((orderData) => {
      return {
        id: order.id,
        user: { ...order.user },
        seller: { ...order.seller },
        detalles: order.detalles,
        ...orderData,
      };
    }),
    findOne: jest.fn(),
  };
  const mockDetalleRepository = {
    create: jest.fn().mockImplementation((dto) => {
      return {
        id: '123',
        quantity: 1,
        precio: 100,
        variant: {
          id: '123',
          company: 'test',
          product: {
            id: '123',
            title: 'test',
            seller: {
              id: '123',
              firstName: 'test',
            },
          },
        },
        order: {
          id: '123',
          user: {},
          seller: {},
          detalles: [],
        },
      };
    }),
  };
  const mockVariantsService = {
    getAllByIds: jest.fn().mockImplementation((ids) => {
      return [
        {
          id: '123',
          company: 'test',
          product: {
            id: '123',
            title: 'test',
            seller: {
              id: '123',
              firstName: 'test',
            },
          },
        },
      ];
    }),
    updateStock: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn().mockImplementation((id) => {
      return {
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
    }),
  };
  const mockSellerService = {
    findOne: jest.fn().mockImplementation((id) => {
      return {
        id: '123',
        email: 'test@hola.com',
        password: '123',
        rol: 'seller',
        orders: [],
        company: 'test',
        firstName: 'test',
        lastName: 'test',
        adress: 'test',
        emailToLowerCase: undefined,
        isActive: true,
        checkBeforeUpdate: undefined,
      };
    }),
  };
  const mockCommonService = {
    getNextPrev: jest.fn().mockImplementation((dto, count) => {
      return { next: 'next', prev: 'prev', pages: 'pages' };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        ConfigService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(Detalle),
          useValue: mockDetalleRepository,
        },
        {
          provide: VariantsService,
          useValue: mockVariantsService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: SellerService,
          useValue: mockSellerService,
        },
        {
          provide: CommonService,
          useValue: mockCommonService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('insert', () => {
    it('should insert a order', () => {
      const id = uuid();
      const createOrderDto = {
        variants: [
          {
            variante: id,
            quantity: 1,
          },
        ],
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

      expect(service.insert(createOrderDto, user)).resolves.toEqual({
        detalles: [],
        id: '123',
        seller: {},
        user: {},
      });
    });
  });
  describe('findAll', () => {
    it('should return an array of orders admin', async () => {
      const user: User = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'asd',
        adress: '123 Main St',
        rol: 'admin',
        isActive: true,
        emailToLowerCase: function () {
          return this.email.toLowerCase();
        },
        checkBeforeUpdate: function () {
          return true;
        },
        order: [],
      };
      const seller: Seller = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'asd',
        company: '123 Main St',
        isActive: true,
        emailToLowerCase: function () {
          return this.email.toLowerCase();
        },
        checkBeforeUpdate: function () {
          return true;
        },
        orders: [],
        products: [],
      };
      const dto: PaginationInput = {
        page: 1,
        limit: 10,
      };
      const myOrder: Order[] = [
        {
          id: '123',
          user: user,
          seller: seller,
          detalles: [],
        },
        {
          id: '124',
          user: user,
          seller: seller,
          detalles: [],
        },
      ];

      jest
        .spyOn(mockOrderRepository, 'findAndCount')
        .mockResolvedValueOnce([myOrder, myOrder.length]);
      jest.spyOn(mockCommonService, 'getNextPrev').mockReturnValueOnce({
        next: 'next',
        prev: 'prev',
        pages: 'pages',
      });

      const result = await service.findAll(user, dto);

      const expected = [myOrder, 'next', 'prev', 'pages'];

      expect(result).toEqual(expected);
    });
  });

  it('should return an array of orders seller', async () => {
    const user = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'asd',
      adress: '123 Main St',
      type: 'user',
      isActive: true,
      emailToLowerCase: function () {
        return this.email.toLowerCase();
      },
      checkBeforeUpdate: function () {
        return true;
      },
      order: [],
    };

    const userRol: User = {
      id: '1',
      firstName: 'John',
      rol: 'user',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'asd',
      adress: '123 Main St',
      isActive: true,
      emailToLowerCase: function () {
        return this.email.toLowerCase();
      },
      checkBeforeUpdate: function () {
        return true;
      },
      order: [],
    };
    const seller: Seller = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'asd',
      company: '123 Main St',
      isActive: true,
      emailToLowerCase: function () {
        return this.email.toLowerCase();
      },
      checkBeforeUpdate: function () {
        return true;
      },
      orders: [],
      products: [],
    };
    const dto: PaginationInput = {
      page: 1,
      limit: 10,
    };
    const myOrder: Order[] = [
      {
        id: '123',
        user: userRol,
        seller: seller,
        detalles: [],
      },
      {
        id: '124',
        user: userRol,
        seller: seller,
        detalles: [],
      },
    ];

    jest
      .spyOn(mockOrderRepository, 'findAndCount')
      .mockResolvedValueOnce([myOrder, myOrder.length]);
    jest.spyOn(mockCommonService, 'getNextPrev').mockReturnValueOnce({
      next: 'next',
      prev: 'prev',
      pages: 'pages',
    });

    const result = await service.findAll(user, dto);

    const expected = [myOrder, 'next', 'prev', 'pages'];

    expect(result).toEqual(expected);
  });

  it('should return an array of orders user', async () => {
    const dto: PaginationInput = {
      page: 1,
      limit: 10,
    };
    const myOrder: Order[] = [
      {
        id: '123',
        user: user,
        seller: seller,
        detalles: [],
      },
      {
        id: '124',
        user: user,
        seller: seller,
        detalles: [],
      },
    ];

    jest
      .spyOn(mockOrderRepository, 'findAndCount')
      .mockResolvedValueOnce([myOrder, myOrder.length]);
    jest.spyOn(mockCommonService, 'getNextPrev').mockReturnValueOnce({
      next: 'next',
      prev: 'prev',
      pages: 'pages',
    });

    const result = await service.findAll(sellerTest, dto);

    const expected = [myOrder, 'next', 'prev', 'pages'];

    expect(result).toEqual(expected);
  });

  describe('delete', () => {
    it('should cancel order with given id', async () => {
      const result = await service.delete(user, order.id);

      expect(mockOrderRepository.preload).toHaveBeenCalledWith({
        id: order.id,
        status: 'Cancelled',
      });

      expect(result).toEqual(`Orden con id: ${order.id} fue cancelada.`);
    });
  });

  describe('getById', () => {
    it('should find and return order with given id if user role is admin', async () => {
      // Define an admin user object
      const adminUser = {
        ...user,
        rol: 'admin',
      };

      mockOrderRepository.findOne = jest.fn().mockResolvedValue(order);

      const result = await service.getById(order.id, adminUser);

      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: order.id,
        },
      });

      // Check if the getById function returns the correct order
      expect(result).toEqual(order);
    });

    it('should throw NotFoundException if order not found and user role is admin', async () => {
      // Define an admin user object
      const adminUser = {
        ...user,
        rol: 'admin',
      };

      mockOrderRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.getById(order.id, adminUser)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: order.id,
        },
      });
    });
    it('should return order with given id for user', async () => {
      const userType = 'user';
      const userId = user.id;
      const orderId = order.id;

      mockOrderRepository.findOne.mockResolvedValue(order);

      const result = await service.getById(orderId, {
        ...user,
        type: userType,
      });

      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: orderId,
          user: {
            id: userId,
          },
        },
      });
      expect(result).toEqual(order);
    });

    it('should return order with given id for seller', async () => {
      const userType = 'seller';
      const userId = seller.id;
      const orderId = order.id;

      mockOrderRepository.findOne.mockResolvedValue(order);

      const result = await service.getById(orderId, {
        ...seller,
        type: userType,
      });

      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: orderId,
          seller: {
            id: userId,
          },
        },
      });
      expect(result).toEqual(order);
    });
  });
});
