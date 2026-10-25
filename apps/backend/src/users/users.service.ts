import { Injectable, NotFoundException,BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt';
import { SignUpDto } from '../dtos/signup.dto';
import { UpdateProfileDto } from '../dtos/updateProfile.dto';


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
    async updateUserToken(userId: string, refreshTokenHased: string | null) {
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

    async updateUserPassword(Id: string, NewPassword_hash: string) {
        await this.prisma.users.update({
            where: {
                id: Id,
            },
            data: {
                password_hash: NewPassword_hash
            }
        })
    }
    async addRestToken(id: string, restToken: string | null, expireDate: Date | null) {
        await this.prisma.users.update({
            where: {
                id
            },
            data:
            {
                reset_token: restToken,
                reset_token_expires_at: expireDate
            }
        })
    }
    async findUserbyToken(reset_token: string) {
        const user = await this.prisma.users.findFirst({
            where:
            {
                reset_token
            }
        })
        let expireDate = null
        if (user)
            expireDate = user.reset_token_expires_at;
        if (!expireDate || expireDate < new Date())
            return null
        return user
    }
    async updateUserProfile(newProfileData: UpdateProfileDto, userId: string) {
        const user = await this.prisma.users.findFirst({
            where: {
                id: userId
            }
        })
        if (!user)
            throw new NotFoundException("User Not found")
        await this.prisma.users.update({
            where: {
                id: userId
            },
            data: {
                first_name: newProfileData.firstName,
                last_name: newProfileData.lastName,
                phone: newProfileData.phone
            }
        })

        return {
            message: "updated successfully",
            success: true
        }
    }
    async listAllUsers(page = 1, limit = 20) {
        return this.prisma.users.findMany({
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true, first_name: true, last_name: true,
                email: true, phone: true, role: true, organization_id: true,
            },
        });
    }
    async deleteUser(targetId: string, requesterId: string) {
        if (targetId === requesterId)
            throw new BadRequestException('You cannot delete yourself');
        const user = await this.prisma.users.findUnique({ where: { id: targetId } });
        if (!user) throw new NotFoundException('User not found');
        if (user.role === 'owner')
            throw new BadRequestException('Delete the organization instead of its owner');
        await this.prisma.users.delete({ where: { id: targetId } });
        return { message: 'User has been deleted' };
    }
}
