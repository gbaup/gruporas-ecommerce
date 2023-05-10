import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Variant } from '../../variants/entities/variant.entity';

@Entity({ name: 'Detalles' })
export class Detalle {
  @PrimaryGeneratedColumn()
  id: number;

  //   @Column()
  //   variant: string;

  @Column()
  quantity: number;

  @Column('float')
  precio: number;

  @ManyToOne(() => Variant, (variant) => variant.detalles, {
    onDelete: 'CASCADE',
  })
  variant: Variant;

  @ManyToOne(() => Order, (order) => order.detalles, {
    onDelete: 'CASCADE',
  })
  order: Order;
}
