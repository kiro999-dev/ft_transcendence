import { Controller, Post, UseGuards, Req, Put } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { SignUpDto } from '../dtos/signup.dto';
import { AuthService } from './auth.service';
import { LoginDTO } from '../dtos/login.dto';
import { refreshTokenDto } from '../dtos/refreshToken.dto';
import { changePasswordDto } from '../dtos/changePassword.dto';
import { AuthGuard } from '../guards/auth.guard';
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}
  @Post('sign-up')
  async signUp(@Body() SignUpData: SignUpDto) {
    return this.auth.signup(SignUpData);
  }

  @Post('login')
  async login(@Body() LogInData: LoginDTO) {
    return this.auth.login(LogInData);
  }
  @Post('refresh')
  async refreshToken(@Body() token: refreshTokenDto) {
    return this.auth.refreshToken(token.refreshToken);
  }

  @UseGuards(AuthGuard)
  @Post('change-password')
  async changePassword(@Body() chpassdata: changePasswordDto, @Req() req: any) {
    const userid = req.user.sub;
    await this.auth.changePassword(chpassdata, userid);
    return {
      message: 'Password changed successfully',
    };
  }
}
