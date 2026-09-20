import { Injectable } from '@nestjs/common';
import { SignUpDto } from '../dtos/signup.dto';
import { LoginDTO } from '../dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { TokensService } from '../tokens/tokens.service';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private userService: UsersService,
    private Token: TokensService
  ) { }

  async signup(SignUpdata: SignUpDto) {
    const { email } = SignUpdata;
    const emailInuUse = await this.userService.findUserbyEmail(email);

    if (emailInuUse)
      throw new BadRequestException('Email already in use');
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
    return {
      accessToken,
      refreshToken,
    };
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

}
