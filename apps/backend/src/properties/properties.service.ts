import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PropertiesService {
    constructor (private prisma: PrismaService) {}

    async findAll(organizationId: string){
        return this.prisma.properties.findMany({
            where: { organization_id: organizationId},
        });
    }
    async findOne(propertyId: string, organizationId: string){
        return this.prisma.properties.findFirst({
            where: { id: propertyId, organization_id: organizationId},
        });
    }
}