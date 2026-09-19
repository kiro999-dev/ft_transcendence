import { Injectable } from '@nestjs/common';
import { SignUpDto } from '../dtos/signup.dto';
import { LoginDTO } from '../dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup(SignUpdata: SignUpDto) {
    const { email, password, organizationName, firstName, lastName, phone } =
      SignUpdata;
    const emailInuUse = await this.prisma.users.findUnique({
      where: { email },
    });

    if (emailInuUse) {
      throw new BadRequestException('Email already in use');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organizations.create({
        data: {
          name: organizationName,
        },
      });

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await tx.users.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          email,
          password_hash: hashedPassword,
          phone,
          organization_id: organization.id,
        },
      });

      return { organization, user };
    });
    return {
      message: 'Account created successfully',
      userId: result.user.id,
      organizationId: result.organization.id,
      role: result.user.role,
    };
  }

  async login(LogInData: LoginDTO) {
    const { email, password } = LogInData;
    const user = await this.prisma.users.findUnique({
      where: { email },
    });
    if (!user) throw new UnauthorizedException('incorrect email or password ');
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      throw new UnauthorizedException('incorrect email or password ');

    const {accessToken , refreshToken}= this.generateTokens(
      user.id,
      user.organization_id,
      user.role,
    );
    await this.saveToken(refreshToken, user.id);
    
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    let payload;
    try {
       payload = this.jwt.verify(token);
    } catch {
      throw new UnauthorizedException('Not authorized');
    }
    const user = await this.prisma.users.findUnique({
      where: {
        id: payload.sub,
      },
    });
    if (!user || !user.token_hash)
    {
      throw new UnauthorizedException('not authorized');
    
    }
    const isMatch: boolean = await bcrypt.compare(token, user.token_hash);
    if (!isMatch){
      console.log('wa anaaa hhhh')
      throw new UnauthorizedException('not authorized');
    }
    const { accessToken , refreshToken} = this.generateTokens(user.id, user.organization_id, user.role);
    await this.saveToken(refreshToken,payload.sub);
    return {accessToken,refreshToken} 
  }

  generateTokens(
    userId: string,
    organizationId: string | null,
    role: string,
  ) {
    const payload = {
      sub: userId,
      organizationId,
      role,
    };
    const accessToken = this.jwt.sign(payload, {
      expiresIn: '1m',
    });

     const refreshToken = this.jwt.sign(
      { sub:userId },
      {
        expiresIn: '7d',
      },
    );

    return {accessToken,refreshToken};
  }

  async saveToken(refreshToken: string, userId: string) {
    const refreshTokenHased = await bcrypt.hash(refreshToken, 10);
    await this.prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        token_hash: refreshTokenHased,
      },
    });
  }
}
