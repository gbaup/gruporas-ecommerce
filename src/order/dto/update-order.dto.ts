import { IsString, Length } from 'class-validator';

export class UpdateOrderDto {
  @Length(2, 20)
  @IsString()
  status: string;
}
