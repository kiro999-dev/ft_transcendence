import {
  IsString,
  IsEmail,
  MinLength,
  Matches,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
export class UseremailDto
{
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
    email:string
}