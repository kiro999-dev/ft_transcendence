import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}
