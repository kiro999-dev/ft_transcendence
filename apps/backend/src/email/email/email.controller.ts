import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { sendEmailDto } from '../../dtos/email.dto';

@Controller('email')
export class EmailController {
    constructor (private emailService:EmailService){}
    @Post('send')
    @HttpCode(HttpStatus.OK)
    async sendEmail(@Body() emaildata:sendEmailDto)
    {
        await this.emailService.sendEmail(emaildata);
        return {message:'Email sent successfuly'}
    }
}
