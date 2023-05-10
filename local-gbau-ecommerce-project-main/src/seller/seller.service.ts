import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Seller } from './entities/seller.entity';
import { Repository } from 'typeorm';
import { PaginationInput } from 'src/common/dto/pagination.dto';
import { CommonService } from 'src/common/common.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SellerService {
  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * @description Funcion que devuelve todos los Sellers.
   * @param paginationInput
   */
  async findAll(paginationInput: PaginationInput) {
    const limit = paginationInput.limit || +this.configService.get('PAG_LIMIT');

    const allSeller = await this.sellerRepository.findAndCount({
      where: { isActive: true },
      take: limit,
      skip: (paginationInput.page - 1) * limit,
    });
    const count = allSeller[1];

    const { next, prev, pages } = this.commonService.getNextPrev(
      paginationInput,
      count,
      'seller',
    );

    return [allSeller[0], next, prev, pages];
  }

  /**
   * @description Funcion que devuelve un Seller por su Id.
   * @param id
   */
  async findOne(id: string): Promise<Seller> {
    const seller = await this.sellerRepository.findOne({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        company: true,
        products: true,
      },
    });
    if (!seller) throw new NotFoundException(`No hay vendedor con id ${id}`);
    return seller;
  }

  /**
   * @description Funcion que actualiza un Seller por su Id.
   * @param id
   * @param updateSellerDto
   */
  async update(
    id: string,
    updateSellerDto: UpdateSellerDto,
    seller: Seller,
  ): Promise<Seller> {
    if (seller.id !== id) throw new NotFoundException(`No tienes permisos`);
    const updateSeller = await this.sellerRepository.preload({
      id,
      ...updateSellerDto,
    });
    if (!seller) throw new NotFoundException(`No hay vendedor con id ${id}`);
    await this.sellerRepository.save(updateSeller);

    return seller;
  }

  /**
   * @description Funcion que Elimina un Seller por su Id.
   * @param id
   */
  async remove(id: string) {
    const seller = await this.findOne(id);
    seller.isActive = false;
    await this.sellerRepository.save(seller);
    return `Vendedor con id ${id} ahora está inactivo`;
  }
}
