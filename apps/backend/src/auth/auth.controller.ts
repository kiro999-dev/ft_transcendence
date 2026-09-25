import { Controller, Post, UseGuards, Req, Put,Res } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { SignUpDto } from '../dtos/signup.dto';
import { AuthService } from './auth.service';
import { LoginDTO } from '../dtos/login.dto';
import { refreshTokenDto } from '../dtos/refreshToken.dto';
import { changePasswordDto } from '../dtos/changePassword.dto';
import { AuthGuard } from '../guards/auth.guard';
import { ForgetPasswordDto } from '../dtos/forgetpass.dto';
import { ResetPasswdDto } from '../dtos/resetpassword.dto';
import type { Response } from 'express';
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}
  @Post('sign-up')
  async signUp(@Body() SignUpData: SignUpDto) {
    return this.auth.signup(SignUpData);
  }

  @Post('login')
  async login(@Body() LogInData: LoginDTO,@Res({ passthrough: true }) res: Response) {
    const {accessToken,refreshToken} = await this.auth.login(LogInData);
      res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, //should be true in prod
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return accessToken
  }
  @Post('refresh')
  async refreshToken(@Body() token: refreshTokenDto,@Res({ passthrough: true }) res: Response) {
    const {refreshToken ,accessToken} = await this.auth.refreshToken(token.refreshToken);
      res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, //should be true in prod
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return accessToken
  }

  @UseGuards(AuthGuard)
  @Put('change-password')
  async changePassword(@Body() chpassdata: changePasswordDto, @Req() req: any) {
    const userid = req.user.sub;
    await this.auth.changePassword(chpassdata, userid);
    return {
      message: 'Password changed successfully',
    };
  }

  @Post('forget-password')
  async forgetPassword(@Body() emailDto:ForgetPasswordDto)
  {
    const {email} = emailDto;

   return await this.auth.forgetPassword(email)
  }

    @Post('reset-password')
  async resetPassword(@Body() ResetPasswdDataDto:ResetPasswdDto)
  {
    const {NewPassword,reset_token} = ResetPasswdDataDto;

   return await this.auth.resetPassword(NewPassword,reset_token);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req:any)
  {
    const userid = req.user.sub
    return await this.auth.logout(userid);
  }
}
