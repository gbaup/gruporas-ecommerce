import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationInput {
  @ApiProperty({
    default: 5,
    description: 'Cuantos valores traer.',
    required: false,
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    default: 1,
    description: 'Que pagina buscar',
    required: false,
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  page?: number = 1;
}
