import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePersonDto {
  @ApiProperty()
  @Length(2, 20)
  @IsString()
  firstName: string;

  @ApiProperty()
  @Length(2, 20)
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe tener una mayuscula, una miniscula y un numero',
  })
  password: string;
}
