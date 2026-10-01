import {
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
export class orgNameDto
{
      @Transform(({ value }) => value.trim().replace(/\s+/g, ' '))
      @MinLength(2)
      @MaxLength(150)
      @IsString()
      @IsNotEmpty()
      organizationName: string;
}