import { ApiProperty } from '@nestjs/swagger';
import { int } from 'aws-sdk/clients/datapipeline';
import { IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  variants: { variante: string; quantity: int }[];
}
