import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateVariantDto, UpdateVariantDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Variant } from './entities/variant.entity';
import { Repository } from 'typeorm';
import { PaginationInput } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { ProductService } from 'src/product/product.service';
import { CommonService } from 'src/common/common.service';
import { S3 } from 'aws-sdk';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class VariantsService {
  private readonly s3: S3;

  private readonly logger = new Logger(VariantsService.name);

  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly configService: ConfigService,
    private readonly productService: ProductService,
    private readonly commonService: CommonService,
  ) {
    this.s3 = new S3({
      accessKeyId: this.configService.get<string>('AWS_AKID'),
      secretAccessKey: this.configService.get<string>('AWS_SAK'),
      region: this.configService.get<string>('AWS_REGION'),
    });
  }

  async insert(createVariantDto: CreateVariantDto) {
    const { productId, ...variantData } = createVariantDto;
    let buff: Buffer;
    let image: string;

    if (createVariantDto.image) {
      const stringBase64 =
        createVariantDto.image.split('data:image/jpeg;base64,')[1] ||
        createVariantDto.image.split('data:image/png;base64,')[0];
      buff = Buffer.from(stringBase64, 'base64');
      const bucketName = await this.configService.get<string>(
        'AWS_BN',
      );
      const key = `${Date.now().toString()}_${createVariantDto.productId
        .replace(/ /g, '_')
        .toLowerCase()}`;
      const params = {
        Bucket: bucketName,
        Key: key,
        Body: buff,
        ContentType: 'image/jpeg',
      };
      const imageUrl = await this.s3.upload(params).promise();
      image = imageUrl.Location;
      variantData.image = image;
    }

    const product = await this.productService.getById(productId);
    product.stock = product.stock + variantData.stock;

    const sameProduct = await this.variantRepository.findAndCount({
      where: { product: { id: productId } },
    });
    const av = sameProduct[0]
      .map((variant) => variant.value)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const averagePrice = (av + variantData.value) / (sameProduct[1] + 1);
    product.averagePrice = +averagePrice.toFixed(2);
    const variant = this.variantRepository.create(variantData);
    variant.product = product;
    variant.name = `${product.title?.toLowerCase().trim().replace(/ /g, '-')}_${
      variantData.color ? variantData.color : ''
    }_${variantData.size ? variantData.size : ''}_${
      variantData.capacity ? variantData.capacity : ''
    }`;
    variant.originalValue = variantData.value;

    await this.productRepository.save(product);
    await this.variantRepository.save(variant);

    return variant;
  }

  /**
   * @param paginationInput
   * @param id
   * @returns Variant
   * @description Funcion que devuelve todas las Variant.
   */
  async getAll(paginationInput: PaginationInput) {
    const { page = 1 } = paginationInput;

    const limit = +this.configService.get('PAG_LIMIT');
    const offset = (page - 1) * limit;

    const queryBuilder = this.variantRepository
      .createQueryBuilder('variant')
      .leftJoinAndSelect('variant.product', 'product.id = variant.productId')
      .take(limit)
      .skip(offset);
    const variants_count = await queryBuilder.getManyAndCount();
    const variants = variants_count[0].map((variant) =>
      Object.fromEntries(
        Object.entries(variant).filter(([k, v]) => v !== null),
      ),
    );
    const count = variants_count[1];

    const { next, prev, pages } = this.commonService.getNextPrev(
      paginationInput,
      count,
      'variants',
    );

    return { pages, prev, next, variants };
  }

  /**
   * @param id
   * @returns Variant
   * @description Funcion que devuelve una Variant dado su Id.
   */
  async getById(id: string) {
    const variant = await this.variantRepository.findOneBy({ id });
    if (!variant) {
      throw new NotFoundException(`Variante con id ${id} no encontrado`);
    }
    return Object.fromEntries(
      Object.entries(variant).filter(([k, v]) => v !== null),
    );
  }

  /**
   * @param id[]
   * @returns Variants
   * @description Endpoint que devuelve todas las Variants dado una array de id.
   */
  async getAllByIds(id: string[]): Promise<Variant[]> {
    if (this.hasDuplicates(id))
      throw new BadRequestException('Error, Id de variantes duplicado');

    const variants = await this.variantRepository
      .createQueryBuilder('variant')
      .where('variant.id IN (:...id)', { id })
      .leftJoinAndSelect('variant.product', 'products')
      .leftJoinAndSelect('products.seller', 'seller')
      .getMany();

    if (variants.length !== id.length) {
      throw new NotFoundException(
        `Al menos una de las variantes no se encontro`,
      );
    }

    return variants;
  }

  /**
   * @param updateVariantDto
   * @param id
   * @returns Variant
   * @description Funcion que Actualiza una Variant dado su Id.
   */
  async update(
    id: string,
    updateVariantDto: UpdateVariantDto,
  ): Promise<Variant> {
    const existingVariant = await this.variantRepository.findOneBy({ id });
    let buff: Buffer;
    let image: string;

    if (updateVariantDto.image) {
      if (existingVariant.image) {
        const key = existingVariant.image.split('amazonaws.com/')[1];

        const params = {
          Bucket: process.env.AWS_BN,
          Key: key,
        };

        try {
          await this.s3.deleteObject(params).promise();
        } catch (error) {
          console.error(error);
          throw new Error('Error al eliminar la imagen de S3');
        }
      }
      const stringBase64 =
        updateVariantDto.image.split('data:image/jpeg;base64,')[1] ||
        updateVariantDto.image.split('data:image/png;base64,')[0];
      buff = Buffer.from(stringBase64, 'base64');

      const bucketName = await this.configService.get<string>(
        'AWS_BN',
      );

      const key = `${Date.now().toString()}_${(
        updateVariantDto.productId || existingVariant.id
      )
        .replace(/ /g, '_')
        .toLowerCase()}`;
      const params = {
        Bucket: bucketName,
        Key: key,
        Body: buff,
        ContentType: 'image/jpeg',
      };
      const imageUrl = await this.s3.upload(params).promise();
      image = imageUrl.Location;
    }
    if (updateVariantDto.stock) {
      const product = await this.productService.getById(
        existingVariant.product.id,
      );

      product.stock =
        product.stock + updateVariantDto.stock - existingVariant.stock;
      await this.productRepository.save(product);
    }
    const update = await this.variantRepository.preload({
      id,
      ...updateVariantDto,
      ...(updateVariantDto.image && { image: image }),
    });
    if (!update) {
      throw new NotFoundException(`Variante con id ${id} no encontrado`);
    }
    await this.variantRepository.save(update);

    return update;
  }

  async updateStock(id: string, stock: number) {
    const existingVariant = await this.variantRepository.findOneBy({ id });
    existingVariant.stock = existingVariant.stock - stock;
    await this.variantRepository.save(existingVariant);
    const product = await this.productService.getById(
      existingVariant.product.id,
    );
    product.stock = product.stock - stock;
    await this.productRepository.save(product);
  }

  /**
   * @param id
   * @returns string
   * @description Funcion que devuelve una Variant dado su Id.
   */
  async delete(id: string) {
    const variant = await this.variantRepository.findOneBy({ id });
    if (!variant) {
      throw new NotFoundException(`Variante con id ${id} no encontrado`);
    }
    await this.variantRepository.remove(variant);
    return `Variante con id ${id} eliminado`;
  }

  private hasDuplicates(array) {
    let valuesSoFar = Object.create(null);
    for (let i = 0; i < array.length; ++i) {
      let value = array[i];
      if (value in valuesSoFar) {
        return true;
      }
      valuesSoFar[value] = true;
    }
    return false;
  }
}
