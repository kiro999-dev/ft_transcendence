import { Controller, Post, UseGuards, Req, Put, Res, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { SignUpDto } from '../dtos/signup.dto';
import { AuthService } from './auth.service';
import { LoginDTO } from '../dtos/login.dto';
import { refreshTokenDto } from '../dtos/refreshToken.dto';
import { changePasswordDto } from '../dtos/changePassword.dto';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { forgotPasswordDto } from '../dtos/forgotpass.dto'
import { ResetPasswdDto } from '../dtos/resetpassword.dto';
import type { Response } from 'express';
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) { }
  @Post('sign-up')
  async signUp(@Body() SignUpData: SignUpDto) {
    return this.auth.signup(SignUpData);
  }

  @Post('login')
  async login(@Body() LogInData: LoginDTO, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.auth.login(LogInData);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, //should be true in prod (https)
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {accessToken,}
  }
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const getRefreshToken = req.cookies.refreshToken;
    const { refreshToken, accessToken } = await this.auth.refreshToken(getRefreshToken);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, //should be true in prod (https)
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken, }
  }

  @UseGuards(AuthenticationGuard)
  @Patch('change-password')
  async changePassword(@Body() chpassdata: changePasswordDto, @Req() req: any) {
    const userid = req.user.sub;
    await this.auth.changePassword(chpassdata, userid);
    return {
      message: 'Password changed successfully',
    };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() emailDto: forgotPasswordDto) {
    const { email } = emailDto;

    return await this.auth.forgotPassword(email)
  }

  @Post('reset-password')
  async resetPassword(@Body() ResetPasswdDataDto: ResetPasswdDto) {
    const { NewPassword, reset_token } = ResetPasswdDataDto;

    return await this.auth.resetPassword(NewPassword, reset_token);
  }

  @Post('logout')
  @UseGuards(AuthenticationGuard)
  async logout(@Req() req: any) {
    const userid = req.user.sub
    return await this.auth.logout(userid);
  }
}
