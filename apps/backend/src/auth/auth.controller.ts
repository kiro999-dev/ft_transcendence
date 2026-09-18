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
    const emailInuUse = await this.prisma.users.findUnique({
      where: { email: SignUpdata.email },
    });
    if (emailInuUse) {
      throw new BadRequestException('Email already in use');
    }
    // const hashedPassword =  bcrypt()
  }
}
