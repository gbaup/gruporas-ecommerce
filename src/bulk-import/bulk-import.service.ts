import { BadRequestException, Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { VariantsService } from 'src/variants/variants.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/product/entities/product.entity';
import { Repository } from 'typeorm';
import { Seller } from 'src/seller/entities/seller.entity';
import { Variant } from 'src/variants/entities/variant.entity';

@Injectable()
export class BulkImportService {
  private readonly s3: S3;

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
    private readonly variantService: VariantsService,

    private readonly configService: ConfigService,
  ) {
    this.s3 = new S3({
      accessKeyId: this.configService.get<string>('AWS_AKID'),
      secretAccessKey: this.configService.get<string>('AWS_SAK'),
      region: this.configService.get<string>('AWS_R'),
    });
  }

  async upload(csvBody: Express.Multer.File, seller: Seller) {
    if (csvBody.mimetype !== 'text/csv') {
      throw new BadRequestException('El formato del archivo debe ser csv');
    }

    const bucketName = await this.configService.get<string>(
      'AWS_BN_CSV',
    );

    const key = `${Date.now().toString()}_${csvBody.originalname}`;

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: csvBody.buffer,
      ContentType: csvBody.mimetype,
    };

    await this.s3.upload(params).promise();

    const stream = new Readable();
    stream.push(csvBody.buffer);
    stream.push(null);

    const results = await new Promise<any[]>((resolve, reject) => {
      const results = [];
      stream
        .pipe(
          csv({
            separator: ';',
            mapValues: ({ value }) => {
              if (value === '') {
                return null;
              }
              return value;
            },
          }),
        )
        .on('data', (data) => results.push(data))
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    const uniqueProducts = results.reduce((acc, product) => {
      const title = product.productTitle.toLowerCase().trim();
      if (!acc[title]) {
        acc[title] = {
          title,
          description: product.productDescription,
        };
      }
      return acc;
    }, {});
    const products: Product[] = Object.values(uniqueProducts);
    const arrayTitles: string[] = products.map((p) =>
      p.title.toLowerCase().trim(),
    );

    const queryproduct = await this.productRepository
      .createQueryBuilder('product')
      .where('product.title IN (:...arrayTitles)', { arrayTitles })
      .where({ seller: seller })
      .getMany();

    const productsDB = [];

    const newProducts = [];

    if (queryproduct.length === 0) {
      products.map((p) => {
        newProducts.push(p);
      });
    } else {
      queryproduct.forEach((prod) => {
        if (!products.some((p) => p.title === prod.title)) {
          newProducts.push(prod);
        }
      });
    }

    const productPromises = [];

    for (let ip = 0; ip < newProducts.length; ip++) {
      const newProduct = {
        title: products[ip].title.toLowerCase().trim(),
        description: products[ip].description,
        seller: seller,
      };
      const product = this.productRepository.create(newProduct);
      productPromises.push(product);
    }

    await this.productRepository.save(productPromises);

    const queryproduct2 = await this.productRepository
      .createQueryBuilder('product')
      .where('product.title IN (:...arrayTitles)', { arrayTitles })
      .where({ seller: seller })
      .getMany();
    //----------------------------------------------
    const variantName: string[] = [];
    for (let i = 0; i < results.length; i++) {
      variantName.push(
        `${results[i].productTitle.toLowerCase().trim().replace(/ /g, '-')}_${
          results[i].color ? results[i].color : ''
        }_${results[i].size ? results[i].size : ''}_${
          results[i].capacity ? results[i].capacity : ''
        }`,
      );
    }

    const queryvariant = await this.variantRepository
      .createQueryBuilder('variant')
      .leftJoinAndSelect('variant.product', 'product')
      .leftJoinAndSelect('product.seller', 'seller')
      .where('variant.name IN (:...variantName)', { variantName })
      .andWhere('product.seller = seller.id', { seller })
      .getMany();

    for (let i = 0; i < results.length; i++) {
      const foundProduct: Product = queryproduct2.find(
        (product) =>
          product.title === results[i].productTitle.toLowerCase().trim(),
      );

      const foundVariant: Variant = queryvariant.find(
        (variant) => variant.name === variantName[i],
      );
      if (!foundVariant) {
        const newVariant = {
          productId: foundProduct.id,
          ...(results[i].color && { color: results[i].color }),
          ...(results[i].company && { company: results[i].company }),
          ...(results[i].design && { design: results[i].design }),
          ...(results[i].size && { size: results[i].size }),
          ...(results[i].capacity && { capacity: results[i].capacity }),
          ...(results[i].stock && { stock: +results[i].stock }),
          ...(results[i].value && { value: +results[i].value }),
          ...(results[i].weight && { weight: results[i].weight }),
          ...(results[i].image && { image: results[i].image }),
        };

        await this.variantService.insert(newVariant);
      } else {
        const newVariant = {
          ...(results[i].stock && {
            stock: +results[i].stock + foundVariant.stock,
          }),
          ...(results[i].value && { value: +results[i].value }),
        };

        await this.variantService.update(foundVariant.id, newVariant);
      }
    }

    return 'Importación exitosa';
  }
}
