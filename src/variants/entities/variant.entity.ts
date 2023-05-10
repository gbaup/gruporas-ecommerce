import { ApiProperty } from '@nestjs/swagger';
import { Detalle } from '../../order/entities/detail.entity';
import { Order } from 'src/order/entities/order.entity';
import { Product } from '../../product/entities/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Variants')
export class Variant {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('text')
  name: string;

  @ApiProperty()
  @Column('text')
  company: string;

  @ApiProperty()
  @ManyToOne(() => Product, (product) => product.variants, { eager: true })
  @JoinTable()
  product: Product;

  @OneToMany(() => Detalle, (detalle) => detalle.variant, {
    cascade: true,
    eager: true,
  })
  detalles?: Detalle[];

  @ApiProperty()
  @Column('float')
  value: number;

  @ApiProperty()
  @Column('float')
  originalValue: number;

  @ApiProperty()
  @Column('text', { nullable: true, array: true })
  color?: string[];

  @ApiProperty()
  @Column('text', { nullable: true })
  design?: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  size?: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  capacityrs?: string;

  @ApiProperty()
  @Column('int', { default: 0 })
  stock: number;

  @ApiProperty()
  @Column('float', { nullable: true })
  weight?: number;

  @ApiProperty()
  @Column('text', { nullable: true })
  image?: string;
}
