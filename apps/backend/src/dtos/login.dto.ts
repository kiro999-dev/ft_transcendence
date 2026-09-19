import { IsEmail, IsString, MaxLength,IsNotEmpty } from "class-validator";

export class LoginDTO
{
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(255)
    email:string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    password:string;
}