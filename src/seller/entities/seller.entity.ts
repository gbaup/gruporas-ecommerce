import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../../order/entities/order.entity';
import { Person } from '../../person/entities/person.entity';
import { Product } from '../../product/entities/product.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('Sellers')
export class Seller extends Person {
  @ApiProperty()
  @Column('text')
  company: string;

  @OneToMany(() => Order, (order) => order.id)
  orders: Order[];

  @OneToMany(() => Product, (product) => product.id)
  products: Product[];
}
