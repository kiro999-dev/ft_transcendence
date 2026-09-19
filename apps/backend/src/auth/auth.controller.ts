import { Controller, Post } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { SignUpDto } from '../dtos/signup.dto';
import { AuthService } from './auth.service';
import { LoginDTO } from '../dtos/login.dto';
import { refreshTokenDto } from '../dtos/refreshToken.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth:AuthService) {}
  @Post('sign-up')
  async signUp(@Body() SignUpData: SignUpDto) {
    return this.auth.signup(SignUpData)
  }

  @Post('login')
  async login(@Body() LogInData:LoginDTO)
  {
    return this.auth.login(LogInData)
  }
  @Post('refresh')
  async refreshToken(@Body() token:refreshTokenDto){
    return this.auth.refreshToken(token.refreshToken)
  }
}
