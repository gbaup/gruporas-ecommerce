import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../product.controller';
import { ProductService } from '../product.service';
import { PaginationInput } from 'src/common/dto/pagination.dto';
import { Seller } from 'src/seller/entities/seller.entity';
import { Product } from '../entities/product.entity';
import { UpdateProductDto } from '../dto/update-product.dto';

describe('ProductController', () => {
  let controller: ProductController;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        ProductService,
        {
          provide: ProductService,
          useValue: {
            getAll: jest.fn(),
            getById: jest.fn(),
            insert: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const paginationInput: PaginationInput = {
        page: 1,
        limit: 10,
      };
      const products = [{ id: 1, name: 'Product 1' }];
      jest.spyOn(productService, 'getAll').mockResolvedValue(products);

      expect(await controller.findAll(paginationInput)).toBe(products);
    });
  });

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
  const product: Product = {
    id: '1',
    averagePrice: 1200,
    description: 'Test description',
    seller: seller,
    stock: 2,
    title: 'Test title',
    variants: [],
  };
  describe('findOne', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should return a product with the given id', async () => {
      jest.spyOn(productService, 'getById').mockResolvedValue(product);

      const result = await controller.findOne('1');

      expect(result).toEqual(product);
    });
  });

  describe('create', () => {
    it('should call productService.insert with correct arguments and return created product', async () => {
      const createdProductMock = { id: '123', ...product };
      jest
        .spyOn(productService, 'insert')
        .mockResolvedValue(createdProductMock);

      const result = await controller.create(seller, product);

      expect(productService.insert).toHaveBeenCalledWith(product, seller);
      expect(result).toEqual(createdProductMock);
    });
  });

  describe('update', () => {
    const productIdMock = '123';
    const updateProductDtoMock: UpdateProductDto = {
      title: 'Updated Product',
      averagePrice: 14.99,
      description: 'This is an updated product',
      stock: 1,
    };
    it('should call productService.update with correct arguments and return updated product', async () => {
      const updatedProductMock = { id: product, ...updateProductDtoMock };
      jest.spyOn(productService, 'update').mockResolvedValue(product);

      const result = await controller.update(
        updateProductDtoMock,
        productIdMock,
        seller,
      );

      expect(productService.update).toHaveBeenCalledWith(
        productIdMock,
        updateProductDtoMock,
        seller,
      );
      expect(result).toEqual(product);
    });
  });

  describe('remove', () => {
    const id = '123';

    it('should remove a product and return the removed product', async () => {
      const removedProductMock: Product = {
        id: '123',
        title: 'Test Product',
        description: 'This is a test product',
        averagePrice: 9.99,
        stock: 5,
        seller: seller,
        variants: [],
      };

      jest
        .spyOn(productService, 'remove')
        .mockResolvedValue(removedProductMock);

      const result = await controller.remove(seller, id);

      expect(productService.remove).toHaveBeenCalledWith(id, seller);
      expect(result).toEqual(removedProductMock);
    });
  });
});
