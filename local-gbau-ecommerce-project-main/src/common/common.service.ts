import { BadRequestException, Injectable } from '@nestjs/common';
import { PaginationInput } from './dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommonService {
  constructor(private readonly configService: ConfigService) {}

  /**
   *
   * @param paginationDto
   * @param count
   * @param service
   * @returns
   * @description Funcion encargada de la paginacion en toda la API.
   */
  public getNextPrev(
    paginationDto: PaginationInput,
    count: number,
    service: string,
  ) {
    const page = paginationDto.page;

    const limit = paginationDto.limit || +this.configService.get('PAG_LIMIT');

    let prev = null;
    let next = null;

    if (page > 1)
      prev =
        this.configService.get('APP_URL') +
        `/${service}?page=` +
        (page - 1) +
        `&limit=${limit}`;

    if (count > limit * page)
      next =
        this.configService.get('APP_URL') +
        `/${service}?page=` +
        (page + 1) +
        `&limit=${limit}`;

    const pages = Math.ceil(count / limit);
    if (paginationDto.page > pages)
      throw new BadRequestException(`Página ${paginationDto.page} no existe`);

    return { pages, prev, next };
  }
}
