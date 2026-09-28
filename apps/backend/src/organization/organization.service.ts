import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StaffUserDto } from '../dtos/StaffUserDto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class OrganizationService {
    constructor(private prisma:PrismaService){}
    async getOrganizationById(id:string)
    {
        return await this.prisma.organizations.findFirst({
            where:{
                id
            }
        })
    }
    async addUserToOrganization(StaffUser:StaffUserDto,orgId:string)
    {
         const {firstName,lastName,email,phone,password} = StaffUser;
         const hashedPassword = await bcrypt.hash(password,10);
          await this.prisma.users.create({
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    role: "staff",
                    password_hash: hashedPassword,
                    phone,
                    organization_id: orgId,
                },
            });
            return {
                message:"user added to Organization "
            }
    }
}
