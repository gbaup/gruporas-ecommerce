import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { PaginationInput } from 'src/common/dto/pagination.dto';
import { Repository } from 'typeorm';
import { SellerService } from '../seller.service';
import { Seller } from '../entities/seller.entity';
import { UpdateSellerDto } from '../dto/update-seller.dto';

describe('SellerService', () => {
  let sellerService: SellerService;
  let sellerRepository: Repository<Seller>;
  const mockConfigService = {
    get: jest.fn(),
  };

  const mockSellerRepository = {
    findAll: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    preload: jest.fn(),
    save: jest.fn(),
  };

  const mockCommonService = {
    getNextPrev: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellerService,
        ConfigService,
        CommonService,
        {
          provide: getRepositoryToken(Seller),
          useValue: mockSellerRepository,
        },
        {
          provide: CommonService,
          useValue: mockCommonService,
        },
      ],
    }).compile();
    sellerRepository = module.get<Repository<Seller>>(
      getRepositoryToken(Seller),
    );
    sellerService = module.get<SellerService>(SellerService);
  });

  it('should be defined', () => {
    expect(sellerService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of sellers', async () => {
      const paginationInput: PaginationInput = {
        page: 1,
        limit: 10,
      };

      const allSeller: Seller[] = [
        {
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
          checkBeforeUpdate: async function () {
            return true;
          },
          orders: [],
          products: [],
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          password: 'password456',
          company: '456 Elm St',
          isActive: false,
          emailToLowerCase: function () {
            return this.email.toLowerCase();
          },
          checkBeforeUpdate: async function () {
            return true;
          },
          orders: [],
          products: [],
        },
      ];

      const expected = [allSeller, 'next', 'prev', 'pages'];

      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce(10);
      jest
        .spyOn(sellerRepository, 'findAndCount')
        .mockResolvedValueOnce([allSeller, allSeller.length]);
      jest.spyOn(mockCommonService, 'getNextPrev').mockReturnValueOnce({
        next: 'next',
        prev: 'prev',
        pages: 'pages',
      });

      const result = await sellerService.findAll(paginationInput);

      expect(result).toEqual(expected);

      expect(sellerRepository.findAndCount).toHaveBeenCalledWith({
        where: { isActive: true },
        take: 10,
        skip: 0,
      });
      expect(mockCommonService.getNextPrev).toHaveBeenCalledWith(
        paginationInput,
        2,
        'seller',
      );
    });
  });

  describe('findOne', () => {
    it('should return a seller', async () => {
      const oneSeller: Seller = {
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
        checkBeforeUpdate: async function () {
          return true;
        },
        orders: [],
        products: [],
      };

      const expected = oneSeller;

      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce(10);
      jest.spyOn(sellerRepository, 'findOne').mockResolvedValueOnce(oneSeller);

      const result = await sellerService.findOne('1');

      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should update a seller', async () => {
      const oneSeller: Seller = {
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
        checkBeforeUpdate: async function () {
          return true;
        },
        orders: [],
        products: [],
      };
      const updateSellerDto: UpdateSellerDto = {
        firstName: 'John',
        lastName: 'Doe 2',
        email: 'john.doe2@example.com',
        company: '124 Main St',
      };

      const expected = oneSeller;

      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce(10);
      jest.spyOn(sellerRepository, 'preload').mockResolvedValueOnce(oneSeller);
      jest.spyOn(sellerRepository, 'save').mockResolvedValueOnce(oneSeller);

      const result = await sellerService.update(
        '1',
        updateSellerDto,
        oneSeller,
      );

      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should remove a seller', async () => {
      const oneSeller: Seller = {
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
        checkBeforeUpdate: async function () {
          return true;
        },
        orders: [],
        products: [],
      };

      const expected = `Vendedor con id 1 ahora está inactivo`;

      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce(10);
      jest.spyOn(sellerService, 'findOne').mockResolvedValueOnce(oneSeller);
      jest.spyOn(sellerRepository, 'save').mockResolvedValueOnce(oneSeller);

      const result = await sellerService.remove('1');

      expect(result).toEqual(expected);
    });
  });
});
