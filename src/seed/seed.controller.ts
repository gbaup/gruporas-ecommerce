import { Controller, Get, UseFilters } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/filters/HttpExceptionFilter';

@Controller('seed')
@UseFilters(new HttpExceptionFilter())
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  /**
   * @description Endpoint para cargar Base de datos.
   * @returns void
   */
  @ApiTags('Seed')
  @Get()
  // @Auth( ValidRoles.admin )
  executeSeed() {
    return this.seedService.runSeed();
  }
}
