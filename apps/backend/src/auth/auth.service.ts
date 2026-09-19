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

    return `hi ${user.first_name + ' ' + user.last_name} `;
  }

  async generateToken(userId: string, organizationId: string, role: string) {
    const payload = {
      sub: userId,
      organizationId,
      role,
    };
    const accessToken = this.jwt.sign(payload, {
      expiresIn: '15m',
    });

    return accessToken;
  }
}
