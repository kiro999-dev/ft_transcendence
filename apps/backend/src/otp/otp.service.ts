import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email/email.service';

@Injectable()
export class OtpService {
  constructor(
    private userService: UsersService,
    private emailService: EmailService,
  ) {}

  
  async sendOtp(user: { id: string; email: string; first_name: string; otp_last_sent_at?: Date | null }) {
    // cooldown 60s
    if (user.otp_last_sent_at && Date.now() - new Date(user.otp_last_sent_at).getTime() < 60_000) {
      throw new BadRequestException('Please wait before requesting a new code');
    }

    const code = randomInt(100000, 1000000).toString();

    await this.userService.saveOtp(user.id, {
      otp_hash: await bcrypt.hash(code, 10),
      otp_expires_at: new Date(Date.now() + 10 * 60 * 1000),
      otp_attempts: 0,
      otp_last_sent_at: new Date(),
    });

    await this.emailService.sendEmail({
      recipients: user.email,
      subject: 'Your verification code',
      html: `Hi ${user.first_name},<br>Your code is <b>${code}</b>. It expires in 10 minutes.`,
    });
  }

  async verifyOtp(userId: string, code: string) {
    const user = await this.userService.findUserbyId(userId);
    if (!user) throw new UnauthorizedException();

    if (!user.otp_hash || !user.otp_expires_at || new Date(user.otp_expires_at) < new Date()) {
      throw new UnauthorizedException('Code expired, request a new one');
    }
    if (user.otp_attempts >= 5) {
      throw new UnauthorizedException('Too many attempts, request a new code');
    }
    if (!(await bcrypt.compare(code, user.otp_hash))) {
      await this.userService.incrementOtpAttempts(userId);
      throw new UnauthorizedException('Invalid code');
    }

    await this.userService.clearOtp(userId); // single use
    return user;
  }
}