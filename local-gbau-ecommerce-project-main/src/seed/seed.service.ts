import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { initialData } from './data/seed-data';
import { User } from 'src/user/entities/user.entity';
import { Seller } from 'src/seller/entities/seller.entity';
import { Product } from 'src/product/entities/product.entity';
import { Variant } from 'src/variants/entities/variant.entity';
import { Order } from '../order/entities/order.entity';
import { Detalle } from 'src/order/entities/detail.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,

    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Detalle)
    private readonly detalleRepository: Repository<Detalle>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertUsers();

    return 'SEED EXECUTED';
  }

  /**
   * @description Funcion que elimina tablas de la base de datos.
   * @returns void
   */
  private async deleteTables() {
    const variantsQueryBuilder = this.variantRepository.createQueryBuilder();
    await variantsQueryBuilder.delete().where({}).execute();

    const productQueryBuilder = this.productRepository.createQueryBuilder();
    await productQueryBuilder.delete().where({}).execute();

    const detalleQueryBuilder = this.detalleRepository.createQueryBuilder();
    await detalleQueryBuilder.delete().where({}).execute();

    const orderQueryBuilder = this.orderRepository.createQueryBuilder();
    await orderQueryBuilder.delete().where({}).execute();

    const sellerQueryBuilder = this.sellerRepository.createQueryBuilder();
    await sellerQueryBuilder.delete().where({}).execute();

    const userQueryBuilder = this.userRepository.createQueryBuilder();
    await userQueryBuilder.delete().where({}).execute();
  }

  /**
   * @description Funcion que carga la base de datos.
   * @returns void
   */
  private async insertUsers() {
    const seedUsers = initialData.users;
    const seedSellers = initialData.sellers;
    const seedProducts = initialData.products;
    const seedVariants = initialData.variants;

    const users: User[] = [];
    const sellers: Seller[] = [];
    const products: Product[] = [];
    const variants: Variant[] = [];
    const orders: Order[] = [];

    seedUsers.forEach((user) => {
      users.push(this.userRepository.create(user));
    });

    seedSellers.forEach((seller) => {
      sellers.push(this.sellerRepository.create(seller));
    });

    const dbUsers = await this.userRepository.save(users);
    const dbSellers = await this.sellerRepository.save(sellers);

    seedProducts.forEach((product) => {
      products.push(
        this.productRepository.create({
          ...product,
          seller: sellers[Math.floor(Math.random() * sellers.length)],
        }),
      );
    });

    const dbProducts = await this.productRepository.save(products);

    let i = 0;
    seedVariants.forEach((variant) => {
      variants.push(
        this.variantRepository.create({
          ...variant,
          product: products[i],
        }),
      );
      if (i < products.length) i++;
    });

    const dbVariants = await this.variantRepository.save(variants);

    for (let index = 0; index < 5; index++) {
      orders.push(
        this.orderRepository.create({
          user: users[Math.floor(Math.random() * users.length)],
          detalles: [
            this.detalleRepository.create({
              variant: variants[index],
              quantity: Math.floor(Math.random() * 10 + 1),
              precio:
                Math.round(
                  Math.floor(Math.random() * 10 + 1) *
                    variants[index].value *
                    100,
                ) / 100,
            }),
          ],
        }),
      );
    }

    orders.forEach((order) => {
      order.seller = order.detalles[0].variant.product.seller;
    });

    const dbOrders = await this.orderRepository.save(orders);

    return dbUsers[0];
  }
}
