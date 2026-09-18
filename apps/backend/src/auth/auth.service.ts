import { Injectable } from '@nestjs/common';
import { SignUpDto } from '../dtos/signup.dto';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
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
}
