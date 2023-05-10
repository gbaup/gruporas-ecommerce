import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from '../dto/create-product.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Seller } from '../../seller/entities/seller.entity';
import { Variant } from 'src/variants/entities/variant.entity';
import { CommonService } from 'src/common/common.service';
import { ConfigService } from '@nestjs/config';
import { UpdateProductDto } from '../dto/update-product.dto';

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: Repository<Product>;
  let variantRepository: Repository<Variant>;
  let sellerRepository: Repository<Seller>;
  let commonService: CommonService;
  let configService: ConfigService;

  const mockedProductRepository = {
    preload: jest.fn().mockImplementation((dto) => {
      return {
        ...dto,
        company: 'company',
        productId: '1',
        stock: 3,
        value: 40.5,
      };
    }),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        CommonService,
        ConfigService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn((x) => new Product()),
            findOneBy: jest.fn((x) => new Product()),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Seller),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn((x) => new Seller()),
          },
        },
        {
          provide: getRepositoryToken(Variant),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn((x) => new Variant()),
          },
        },
      ],
    }).compile();

    productService = moduleRef.get<ProductService>(ProductService);
    productRepository = moduleRef.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    variantRepository = moduleRef.get<Repository<Variant>>(
      getRepositoryToken(Variant),
    );
    sellerRepository = moduleRef.get<Repository<Seller>>(
      getRepositoryToken(Seller),
    );
    commonService = moduleRef.get<CommonService>(CommonService);
    configService = moduleRef.get<ConfigService>(ConfigService);
  });

  const createProductDto: CreateProductDto = {
    title: 'Test title',
    description: 'Test description',
    averagePrice: 99.99,
    stock: 10,
  };
  const seller: Seller = {
    id: '1',
    company: 'Test Company',
    firstName: 'Test seller Firstname',
    lastName: 'Test seller Lastname',
    email: 'test@test.com',
    password: '',
    products: [],
    isActive: true,
    orders: [],
    emailToLowerCase: function (): void {
      throw new Error('Function not implemented.');
    },
    checkBeforeUpdate: function (): void {
      throw new Error('Function not implemented.');
    },
  };
  const savedProduct: Product = {
    id: '1',
    title: 'Test title',
    description: 'Test description',
    averagePrice: 99.99,
    stock: 10,
    variants: [],
    seller: seller,
  };

  describe('insert', () => {
    it('should insert a new product', async () => {
      jest.spyOn(productRepository, 'create').mockReturnValue(savedProduct);
      jest.spyOn(productRepository, 'save').mockResolvedValue(savedProduct);

      const result = await productService.insert(createProductDto, seller);

      expect(productRepository.create).toHaveBeenCalledWith({
        ...createProductDto,
        seller: seller,
      });
      expect(productRepository.save).toHaveBeenCalledWith(savedProduct);
      expect(result).toMatchObject({
        title: 'Test title',
        description: 'Test description',
        averagePrice: 99.99,
        stock: 10,
        seller: {
          company: 'Test Company',
          firstName: 'Test seller Firstname',
          lastName: 'Test seller Lastname',
          email: 'test@test.com',
          password: '',
          products: [],
          isActive: true,
          orders: [],
        },
      });
    });
  });

  describe('getById', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return the product with the given id', async () => {
      const id = '1';
      const product = {
        id,
        name: 'Test product',
        description: 'Test description',
        stock: 10,
        image: '',
        title: 'Test title',
        averagePrice: 99.99,
        seller: {
          id: '1',
          name: 'Test seller',
          email: 'test@test.com',
          password: '',
          products: [],
          company: 'Test Company',
          firstName: 'Test seller Firstname',
          lastName: 'Test seller Lastname',
          isActive: true,
          orders: [],
          emailToLowerCase: function (): void {
            throw new Error('Function not implemented.');
          },
          checkBeforeUpdate: function (): void {
            throw new Error('Function not implemented.');
          },
        },
        variants: [],
      };

      const findOneBySpy = jest
        .spyOn(productRepository, 'findOneBy')
        .mockResolvedValue(product);

      const result = await productService.getById(id);

      expect(findOneBySpy).toHaveBeenCalledWith({ id });
      expect(result).toEqual(product);
    });

    it('should throw NotFoundException when product with given id is not found', async () => {
      const id = '1';
      jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(undefined);

      try {
        await productService.getById(id);
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual(`Producto con id ${id} no encontrado`);
      }
    });
  });

  describe('remove', () => {
    savedProduct.id = '1';

    it('should delete and return the product when found', async () => {
      jest
        .spyOn(productRepository, 'findOneBy')
        .mockResolvedValueOnce(savedProduct);
      jest
        .spyOn(productRepository, 'delete')
        .mockResolvedValueOnce({ raw: {}, affected: 1 });

      const result = await productService.remove(savedProduct.id, seller);

      expect(productRepository.findOneBy).toHaveBeenCalledWith({
        id: savedProduct.id,
      });
      expect(productRepository.delete).toHaveBeenCalledWith(savedProduct.id);
    });

    it('should throw NotFoundException when product is not found', async () => {
      jest
        .spyOn(productRepository, 'findOneBy')
        .mockResolvedValueOnce(undefined);

      await expect(
        productService.remove(savedProduct.id, seller),
      ).rejects.toThrowError(new NotFoundException(`Producto no encontrado`));
    });
  });

  describe('getAll', () => {
    it('should return a list of products', async () => {
      const paginationInput = {
        page: 1,
        limit: 10,
      };

      const mockProducts = [savedProduct];

      const mockPagination = {
        next: 2,
        prev: null,
        pages: 1,
      };

      jest
        .spyOn(productRepository, 'findAndCount')
        .mockResolvedValueOnce([mockProducts, mockProducts.length]);
      jest.spyOn(configService, 'get').mockReturnValueOnce(10);
      jest
        .spyOn(commonService, 'getNextPrev')
        .mockReturnValueOnce(mockPagination);

      const result = await productService.getAll(paginationInput);

      expect(productRepository.findAndCount).toHaveBeenCalledWith({
        take: paginationInput.limit || 10,
        skip: (paginationInput.page - 1) * (paginationInput.limit || 10),
      });
      expect(commonService.getNextPrev).toHaveBeenCalledWith(
        paginationInput,
        mockProducts.length,
        'product',
      );
      expect(result).toEqual([
        mockProducts,
        mockPagination.next,
        mockPagination.prev,
        mockPagination.pages,
      ]);
    });
  });

  const mockId = 'mockId';
  const mockUpdateProductDto: UpdateProductDto = {
    title: 'Title test',
    description: 'Description test',
    averagePrice: 1000,
    stock: 0,
  };
  describe('update', () => {
    it('should throw NotFoundException if the product does not exist', async () => {
      jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(undefined);

      await expect(
        productService.update(mockId, mockUpdateProductDto, seller),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should throw UnauthorizedException if the seller is not the creator of the product', async () => {
      const mockId = '1';
      const mockUpdateProductDto = { title: 'New Title' };
      jest.spyOn(productRepository, 'findOneBy');
      jest.spyOn(mockedProductRepository, 'preload');
      await expect(
        productService.update(mockId, mockUpdateProductDto, seller),
      ).rejects.toThrowError(UnauthorizedException);
    });
  });
});
