import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StaffUserDto } from '../dtos/StaffUserDto';
import * as bcrypt from 'bcrypt';
import { Role } from '../users/users.service';
@Injectable()
export class OrganizationService {
    constructor(private prisma: PrismaService) { }
    async getOrganizationById(id: string) {
        return await this.prisma.organizations.findFirst({
            where: {
                id
            }
        })
    }

    async removeUserOrganization(orgId: string, email: string) {



        const user = await this.prisma.users.findUnique({
            where:
            {
                email,
                organization_id: orgId
            }

        })
        if (!user)
            throw new NotFoundException("User not found in your organization")
        if (user.role === 'owner') {
            throw new BadRequestException(
                'Organization owner cannot be deleted',
            );
        }
        await this.prisma.users.delete(
            {
                where: {
                    email
                }
            })
        return {
            message: "User  has been Deleted"
        }
    }
    async addUserToOrganization(StaffUser: StaffUserDto, orgId: string) {

        const { firstName, lastName, email, phone, password } = StaffUser;
        const user = await this.prisma.users.findFirst({
            where: {
                email
            }
        })
        if (user)
            throw new BadRequestException("email already in use");
        const role: Role = "staff";
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.prisma.users.create({
            data: {
                first_name: firstName,
                last_name: lastName,
                email,
                role,
                password_hash: hashedPassword,
                phone,
                organization_id: orgId,
            },
        });
        return {
            message: "user added to Organization "
        }
    }
    async getOrganizationUsers(orgId: string) {
        return await this.prisma.users.findMany({
            where: {
                organization_id: orgId
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                role: true,
            },

        })
    }
}
