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
      role:result.user.role
    };
  }
}
