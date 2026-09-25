import { Injectable, NotFoundException, Res } from '@nestjs/common';
import { SignUpDto } from '../dtos/signup.dto';
import { LoginDTO } from '../dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { TokensService } from '../tokens/tokens.service';
import { changePasswordDto } from '../dtos/changePassword.dto';
import { nanoid } from 'nanoid';
import { EmailService } from '../email/email/email.service';
import { sendEmailDto } from '../dtos/email.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private userService: UsersService,
    private Token: TokensService,
    private emailService: EmailService,
  ) {}

  async signup(SignUpdata: SignUpDto) {
    const { email } = SignUpdata;
    const emailInuUse = await this.userService.findUserbyEmail(email);

    if (emailInuUse) throw new BadRequestException('Email already in use');
    const result = await this.userService.creatUserWithOrganization(SignUpdata);
    return {
      message: 'Account created successfully',
      userId: result.user.id,
      organizationId: result.organization.id,
      role: result.user.role,
    };
  }

  async login(LogInData: LoginDTO) {
    const { email, password } = LogInData;

    const user = await this.userService.findUserbyEmail(email);

    if (!user) throw new UnauthorizedException('incorrect email or password ');

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      throw new UnauthorizedException('incorrect email or password ');

    const { accessToken, refreshToken } = this.Token.generateTokens(
      user.id,
      user.organization_id,
      user.role,
    );
    await this.Token.saveToken(refreshToken, user.id);
    return { accessToken ,refreshToken};
  }

  async refreshToken(token: string) {
   
    let payload;
    try {
      payload = this.jwt.verify(token, {
        secret: this.config.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      });
    } catch {
    
      throw new UnauthorizedException('invalid refresh token');
    }
    const user = await this.userService.findUserbyId(payload.sub);
    if (!user || !user.token_hash) {
      throw new UnauthorizedException('not authorized');
    }
    const isMatch: boolean = this.Token.hashToken(token) === user.token_hash;

    if (!isMatch) throw new UnauthorizedException('not authorized');

    const { accessToken, refreshToken } = this.Token.generateTokens(
      user.id,
      user.organization_id,
      user.role,
    );
 
    await this.Token.saveToken(refreshToken, payload.sub);
    return { accessToken, refreshToken };
  }
  async changePassword(chpassdata: changePasswordDto, userId: string) {
    const user = await this.userService.findUserbyId(userId);
    if (!user) throw new UnauthorizedException('there is no user with this id');
    const isMatch = await bcrypt.compare(
      chpassdata.OldPassword,
      user.password_hash,
    );
    if (!isMatch) throw new UnauthorizedException('inccorect password');
    const NewPassword_hash = await bcrypt.hash(chpassdata.NewPassword, 10);
    await this.userService.updateUserPassword(userId, NewPassword_hash);
  }
  async forgetPassword(email: string) {
    const user = await this.userService.findUserbyEmail(email);
    if (user) {
      const expireDate = new Date();
      expireDate.setMinutes(expireDate.getMinutes() + 15);
      const restToken = nanoid(64);
      await this.userService.addRestToken(user.id, restToken, expireDate);
      const subject = 'Reset Link';
      const link = `http://localhost/reset-password?token=${restToken}`;
      const html = `Hi ${user.first_name},
              We received a request to reset your password.
              <a href="${link}">Reset Password</a>
              This link will expire in 15 minutes.
              If you didn't request this, you can ignore this email.
              Thanks,<br>
              auto Estat Team`;
      const emaildata: sendEmailDto = {
        recipients: user.email,
        subject,
        html,
      };
      await this.emailService.sendEmail(emaildata);
    }

    return {
      message: 'Check your email. The reset link expires in 15 minutes.',
    };
  }

  async resetPassword(new_password: string, token: string) {
    const user = await this.userService.findUserbyToken(token);
    if (!user) {
      throw new BadRequestException('Invalid token or expired');
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await this.userService.updateUserPassword(user.id, hashedPassword);
    await this.userService.addRestToken(user.id, null, null);
    return {
      message: 'Password has been reset successfully',
    };
  }
  async logout(userId: string) {
    const user = await this.userService.findUserbyId(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userService.updateUserToken(userId, null);
    return {
      message: 'Logged out successfully',
    };
  }
}
