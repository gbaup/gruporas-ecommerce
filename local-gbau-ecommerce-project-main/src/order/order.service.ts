import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationInput } from 'src/common/dto/pagination.dto';
import { SellerService } from 'src/seller/seller.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { VariantsService } from 'src/variants/variants.service';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { CommonService } from 'src/common/common.service';
import { ConfigService } from '@nestjs/config';
import { Detalle } from './entities/detail.entity';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Detalle)
    private readonly detalleRepository: Repository<Detalle>,
    private readonly variantsService: VariantsService,
    private readonly userService: UserService,
    private readonly sellerService: SellerService,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
  ) {}

  /**
   *
   * @param createOrderDto
   * @param user
   * @returns Order
   * @description Funcion que crea una Orden y su Detalle correspondiente.
   */
  async insert(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    const { variants } = createOrderDto;
    const variantsIds = variants.map((v) => v.variante);
    const quantityIds = variants.map((v) => v.quantity);

    const uuid = require('uuid');
    variantsIds.map((v) => {
      if (!uuid.validate(v))
        throw new BadRequestException(`Error, el ID ${v} debe ser UUID`);
    });

    const variantsObjects = await this.variantsService.getAllByIds(variantsIds);
    const myUser = await this.userService.findOne(user.id);
    const mySeller = await this.sellerService.findOne(
      variantsObjects[0].product.seller.id,
    );

    const newOrder = this.orderRepository.create({
      user: myUser,
      seller: mySeller,
      detalles: variantsObjects.map((det, index) => {
        return this.detalleRepository.create({
          variant: det,
          quantity: quantityIds[index],
          precio: Math.round(quantityIds[index] * det.value * 100) / 100,
        });
      }),
    });

    await this.orderRepository.save(newOrder);

    variantsIds.map((v, index) => {
      this.variantsService.updateStock(v, quantityIds[index]);
    });

    return newOrder;
  }

  /**
   *
   * @param user
   * @param paginationDto
   * @returns Order[]
   * @description Funcion que devuelve todas las ordenes
   */
  async findAll(user, paginationDto: PaginationInput) {
    const limit = paginationDto.limit || +this.configService.get('PAG_LIMIT');
    let orders: Order[];
    let count: number;

    if (user.rol === 'admin') {
      const llamada = await this.orderRepository.findAndCount({
        take: limit,
        skip: (paginationDto.page - 1) * limit,
      });
      (orders = llamada[0]), (count = llamada[1]);

      const { next, prev, pages } = this.commonService.getNextPrev(
        paginationDto,
        count,
        'orders',
      );

      return [orders, next, prev, pages];
    }

    if (user.type === 'user') {
      const llamada = await this.orderRepository.findAndCount({
        where: {
          user: {
            id: user.id,
          },
        },
        take: limit,
        skip: (paginationDto.page - 1) * limit,
      });
      (orders = llamada[0]), (count = llamada[1]);

      const { next, prev, pages } = this.commonService.getNextPrev(
        paginationDto,
        count,
        'orders',
      );

      return [orders, next, prev, pages];
    }

    if (user.type === 'seller') {
      const llamada = await this.orderRepository.findAndCount({
        where: {
          seller: {
            id: user.id,
          },
        },
        take: limit,
        skip: (paginationDto.page - 1) * limit,
      });
      (orders = llamada[0]), (count = llamada[1]);

      const { next, prev, pages } = this.commonService.getNextPrev(
        paginationDto,
        count,
        'orders',
      );

      return [orders, next, prev, pages];
    }
  }

  /**
   *
   * @param id
   * @returns Order
   * @description Funcion que devuelve una orden por su Id.
   */
  async getById(id: string, user) {
    if (user.rol === 'admin') {
      const order = await this.orderRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!order) {
        throw new NotFoundException(`Orden con id: ${id} no encontrada`);
      }
      return order;
    }
    if (user.type === 'user') {
      const order = await this.orderRepository.findOne({
        where: {
          id: id,
          user: {
            id: user.id,
          },
        },
      });
      if (!order) {
        throw new NotFoundException(`Orden con id: ${id} no encontrada`);
      }
      return order;
    }
    if (user.type === 'seller') {
      const order = await this.orderRepository.findOne({
        where: {
          id: id,
          seller: {
            id: user.id,
          },
        },
      });
      if (!order) {
        throw new NotFoundException(`Orden con id: ${id} no encontrada`);
      }
      return order;
    }
  }

  /**
   *
   * @param user
   * @param id
   * @param updateOrderDto
   * @returns Order
   * @description Funcion que edita una Orden
   */
  async update(user, id: string, updateOrderDto: UpdateOrderDto) {
    const { status } = updateOrderDto;
    if (user.rol === 'admin') {
      const order = await this.orderRepository.preload({
        id,
        status,
      });
      if (!order) {
        throw new NotFoundException(`Orden con id: ${id} no encontrada`);
      }
      this.orderRepository.save(order);
      return order;
    } else {
      const changeOrder = await this.getById(id, user);
      if (!changeOrder) {
        throw new NotFoundException(`Orden con id: ${id} no encontrada`);
      }

      const order = await this.orderRepository.preload({
        id,
        status,
      });
      this.orderRepository.save(order);
      return order;
    }
  }

  /**
   *
   * @param user
   * @param id
   * @returns string
   * @description Funcion que elimina una Orden
   */
  async delete(user, id: string) {
    const order = await this.getById(id, user);
    const deleteOrder = await this.orderRepository.preload({
      id,
      status: 'Cancelled',
    });
    await this.orderRepository.save(deleteOrder);

    return `Orden con id: ${id} fue cancelada.`;
  }
}
