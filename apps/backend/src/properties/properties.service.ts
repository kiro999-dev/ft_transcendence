import { Injectable} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { get } from 'http';

@Injectable()
export class PropertiesService {
    constructor (private prisma: PrismaService) {}

    async findAll(organizationId: string, query: QueryPropertyDto){
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const where: any = { organization_id: organizationId};

        if (query.city)
            where.city = query.city;
        if (query.listing_type)
            where.listing_type = query.listing_type;
        if (query.property_type)
            where.property_type = query.property_type;
        if (query.status)
            where.status = query.status;
        else
            where.status = {not: 'hidden'};
        if (query.minPrice || query.maxPrice)
            where.price = {};
        if (query.maxPrice)
            where.price.lte = Number(query.maxPrice);
        if (query.minPrice)
            where.price.gte = Number(query.minPrice);
        if (query.bedrooms)
            where.bedrooms = { gte: Number(query.bedrooms)};
        return this.prisma.properties.findMany({
            where: where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {created_at: 'desc'},
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