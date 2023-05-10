import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @Length(2, 30)
  title: string;

  @ApiProperty()
  @IsString()
  @Length(5, 100)
  description: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  averagePrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  stock?: number;
}
