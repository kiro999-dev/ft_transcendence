import { IsString } from "class-validator";

export class resendOtpDto
{
    @IsString()
    tempToken: string;
}