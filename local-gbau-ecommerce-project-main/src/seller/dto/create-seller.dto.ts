import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { CreatePersonDto } from '../../person/dto/create-person.dto';

export class CreateSellerDto extends CreatePersonDto {
  @ApiProperty()
  @IsString()
  @Length(3, 255)
  company: string;
}
