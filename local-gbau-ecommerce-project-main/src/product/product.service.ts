import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Seller } from 'src/seller/entities/seller.entity';
import { PaginationInput } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { CommonService } from 'src/common/common.service';
import { S3 } from 'aws-sdk';
import { Variant } from 'src/variants/entities/variant.entity';

@Injectable()
export class ProductService {
  private readonly s3: S3;
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
  ) {
    this.s3 = new S3({
      accessKeyId: this.configService.get<string>('AWS_AKID'),
      secretAccessKey: this.configService.get<string>('AWS_SAK'),
      region: this.configService.get<string>('AWS_REGION'),
    });
  }

  /**
   *
   * @param paginationInput
   * @returns Product[]
   * @description Funcion que devuelve todos los productos
   */
  async getAll(paginationInput: PaginationInput) {
    const limit = paginationInput.limit || +this.configService.get('PAG_LIMIT');

    const allProduct = await this.productRepository.findAndCount({
      take: limit,
      skip: (paginationInput.page - 1) * limit,
    });
    const count = allProduct[1];

    const { next, prev, pages } = this.commonService.getNextPrev(
      paginationInput,
      count,
      'product',
    );

    return [allProduct[0], next, prev, pages];
  }

  /**
   *
   * @param id
   * @returns Producto
   * @description Funcion que devuelve un Producto por su Id.
   */
  async getById(id: string) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    return product;
  }

  /**
   *
   * @param createProductDto
   * @param seller
   * @returns Product
   * @description Funcion que crea un Producto.
   */
  async insert(createProductDto: CreateProductDto, seller: Seller) {
    const newProduct = {
      ...createProductDto,
      seller: seller,
    };
    const product = this.productRepository.create(newProduct);

    await this.productRepository.save(product);
    return newProduct;
  }

  /**
   *
   * @param id
   * @param updateProductDto
   * @param seller
   * @returns Product
   * @description Funcion que actializa un producto
   */
  async update(id: string, updateProductDto: UpdateProductDto, seller: Seller) {
    const newProduct = await this.productRepository.findOneBy({ id });

    if (!newProduct) {
      throw new NotFoundException('Producto no encontrado');
    }
    if (seller.id !== newProduct.seller?.id)
      throw new UnauthorizedException(
        'Deberías ser el creador del producto para poder actualizarlo',
      );
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
    });

    this.productRepository.save(product);
    return product;
  }

  /**
   *
   * @param id
   * @param seller
   * @returns string
   * @description Funcion que elimina un producto.
   */
  async remove(id: string, seller: Seller) {
    const newProduct = await this.productRepository.findOneBy({ id });

    if (!newProduct) {
      throw new NotFoundException(`Producto no encontrado`);
    }
    if (seller.id !== newProduct.seller.id)
      throw new UnauthorizedException(
        'Deberías ser el creador del producto o administrador para poder eliminarlo',
      );
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Producto no encontrado`);
    }
    await this.productRepository.delete(id);
    return product;
  }
}
