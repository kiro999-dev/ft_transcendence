import { BadRequestException, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer'
import { ConfigService } from '@nestjs/config';
import { sendEmailDto } from '../../dtos/email.dto';
@Injectable()
export class EmailService {
    constructor(private readonly config:ConfigService){}
    emailTransport()
    {
        const password = this.config.get<string>('GOOGLE_PASSWORD')
        const email =  this.config.get<string>('GOOGLE_EMAIL')
        const host = this.config.get<string>('EMAIL_HOST')
        const port = this.config.get<string>('EMAIL_PORT')
        const transporter = nodemailer.createTransport({
            host: host,
            port: port,
            secure:false ,
            auth:{
                user:email,
                pass:password,

            }
        });
        return transporter;
    }

    async sendEmail(emailData:sendEmailDto)
    {
        const email = this.config.get<string>('GOOGLE_EMAIL')
        const {recipients,subject,html} = emailData
        const transport = this.emailTransport();
        const options:nodemailer.SendMailOptions={
            from:email,
            to:recipients,
            subject:subject,
            html:html
        };
        await transport.sendMail(options)
    }
}
