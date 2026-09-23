import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  MinLength,
  Matches,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class SignUpDto {
  @Transform(({ value }) => value.trim().replace(/\s+/g, ' '))
  @MinLength(2)
  @MaxLength(150)
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @MaxLength(100)
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  @Matches(/^\S+$/, {
    message: 'First name must not contain spaces',
  })
  firstName: string;

  @MaxLength(100)
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  @Matches(/^\S+$/, {
    message: 'Last name must not contain spaces',
  })
  lastName: string;


  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9_.-]+[a-zA-Z0-9]@[a-zA-Z]+\.[a-z]{1,3}$/, {
    message: 'must be a valid email',
  })
  @MaxLength(255)
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/[0-9]/, {
    message: 'Password must contain at least one number',
  })
  password: string;

  @IsPhoneNumber()
  phone: string;
}
