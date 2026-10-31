import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

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
    async create(dto: CreatePropertyDto, organizationId: string){
        return this.prisma.properties.create({
            data: {...dto , organization_id: organizationId}
        });
    }
   async update(dto: UpdatePropertyDto, propertyId: string, organizationId: string){
        const property = await this.findOne(propertyId, organizationId);
        if (!property)
            return null;
        return this.prisma.properties.update({
            where: {id: propertyId},
            data: {...dto, updated_at: new Date()},
        });
    }
    async archive(propertyId: string, organizationId: string){
        const property = await this.findOne(propertyId, organizationId);
        if (!property)
            return null;
        return this.prisma.properties.update({
            where: {id: propertyId},
            data: {status: 'hidden', updated_at: new Date()},
        });
    }
}