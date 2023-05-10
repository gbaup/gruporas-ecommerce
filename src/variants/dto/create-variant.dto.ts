import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateVariantDto {
  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(
    [
      'RED',
      'BLUE',
      'GREEN',
      'YELLOW',
      'BLACK',
      'WHITE',
      'PINK',
      'PURPLE',
      'ORANGE',
      'BROWN',
      'GRAY',
      'GOLD',
      'SILVER',
      'MULTICOLOR',
    ],
    { each: true },
  )
  color?: string[];

  @ApiProperty()
  @IsString()
  @Length(1, 255)
  company: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(1, 255)
  design?: string;

  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsIn(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
  size?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  capacity?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  image?: string;
}
