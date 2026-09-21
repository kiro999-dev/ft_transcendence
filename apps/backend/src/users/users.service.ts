import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt';
import { SignUpDto } from '../dtos/signup.dto';
@Injectable()
export class UsersService {

    constructor(private prisma: PrismaService) { }

    async findUserbyEmail(email: string) {
        const user = await this.prisma.users.findUnique({
            where: { email },
        });
        return user
    }

    async findUserbyId(id: string) {
        const user = await this.prisma.users.findUnique({
            where: { id },
        });
        return user
    }
    async updateUserToken(userId: string, refreshTokenHased: string) {
        await this.prisma.users.update({
            where: {
                id: userId,
            },
            data: {
                token_hash: refreshTokenHased,
            },
        });
    }
    async creatUserWithOrganization(SignUpdata: SignUpDto) {

        const { organizationName, firstName, lastName, email, phone, password } = SignUpdata
        const result = this.prisma.$transaction(async (tx) => {
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
        return result;
    }

    async updateUserPassword(Id:string,NewPassword_hash:string)
    {
       await  this.prisma.users.update({
            where: {
                id: Id,
            },
            data:{
                password_hash:NewPassword_hash
            }
        })
    }
}
