import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../../order/entities/order.entity';
import { Person } from '../../person/entities/person.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('Users')
export class User extends Person {
  @ApiProperty()
  @Column('text')
  adress: string;

  @Column('text', { default: 'common' })
  rol: string;

  @OneToMany(() => Order, (order) => order.id)
  order: Order[];
}
