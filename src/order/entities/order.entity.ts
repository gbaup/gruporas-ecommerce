import { User } from '../../user/entities/user.entity';
import { Seller } from '../../seller/entities/seller.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Detalle } from './detail.entity';

@Entity('Orders')
export class Order {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('text', { default: 'Pending' })
  status?: string;

  @ApiProperty()
  @Column('date', { default: () => 'CURRENT_TIMESTAMP(6)' })
  date?: Date;

  @OneToMany(() => Detalle, (detalle) => detalle.order, {
    cascade: true,
    eager: true,
  })
  detalles?: Detalle[];

  @ApiProperty()
  @ManyToOne(() => User, (user) => user.order, { eager: true })
  user: User;

  @ApiProperty()
  @ManyToOne(() => Seller, (seller) => seller.orders, { eager: true })
  seller: Seller;
}
