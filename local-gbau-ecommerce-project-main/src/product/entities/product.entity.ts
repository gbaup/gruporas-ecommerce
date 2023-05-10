import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Seller } from '../../seller/entities/seller.entity';
import { Variant } from '../../variants/entities/variant.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Products')
export class Product {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('text')
  title: string;

  @ApiProperty()
  @Column('text')
  description: string;

  @ApiProperty()
  @Column('float', { default: 0 })
  @Min(0)
  averagePrice: number;

  @ApiProperty()
  @Column({ default: 0 })
  @IsInt()
  stock: number;

  @ApiProperty()
  @ManyToOne(() => Seller, (seller) => seller.id, {
    eager: true,
  })
  @JoinTable()
  seller: Seller;

  @OneToMany(() => Variant, (variant) => variant.id)
  variants: Variant[];
}
