import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email/email.module';

@Module({
  imports: [UsersModule, EmailModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
