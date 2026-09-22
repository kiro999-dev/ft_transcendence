import { IsString ,MinLength,MaxLength,Matches  } from "class-validator";

export class ResetPasswdDto
{
    @IsString()
    reset_token:string

    @IsString()
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
    NewPassword:string
}