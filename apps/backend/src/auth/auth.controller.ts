import { BadRequestException, Controller, Post } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { SignUpDto } from '../dtos/signup.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
@Controller('auth')
export class AuthController {
  constructor(private prisma: PrismaService) {}
  @Post('/sign-up')
  async signUp(@Body() SignUpdata: SignUpDto) {
    const { email, password, organizationName ,firstName,lastName,phone,} = SignUpdata;
    const emailInuUse = await this.prisma.users.findUnique({
      where: { email },
    });

    if (emailInuUse) {
      throw new BadRequestException('Email already in use');
    }

    // const organization = await this.prisma.organizations.create({

    //   data:{
    //     name:organizationName
    //   },
    // })
    const hashedPassword = bcrypt.hash(password, 10);
    const user = await this.prisma.users.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash: passwordHash,
        phone: dto.phone,
        organizationId: organizationId,
      },
    });
  }
}
