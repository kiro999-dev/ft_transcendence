import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StaffUserDto } from '../dtos/StaffUserDto';
import * as bcrypt from 'bcrypt';
import { Role } from '../decorator/roles.decorator';
@Injectable()
export class OrganizationService {

    constructor(private prisma: PrismaService) { }
    async getOrganizationById(id: string) {
        return this.prisma.organizations.findFirst({
            where: {
                id
            }
        })
    }
    async deleteOrganization(id:string)
    {
        const org = await this.getOrganizationById(id)
        if(!org)
            throw new NotFoundException("Organization Not Found")
        await this.prisma.organizations.delete({
            where:{
                id
            }
        })
    }
    async getAllOrganizations()
    {
        return this.prisma.organizations.findMany()
    }
    async removeUserOrganization(orgId: string, id: string) {
        const user = await this.prisma.users.findFirst({
            where:{
                id,
                organization_id :orgId
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
                    id
                }
            })
        return {
            message: "User has been Deleted"
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
        return this.prisma.users.findMany({
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
