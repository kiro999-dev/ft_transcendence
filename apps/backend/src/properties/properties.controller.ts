import { Controller, Get, UseGuards, Req, NotFoundException, Param, ParseUUIDPipe, Post, Body } from '@nestjs/common';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';

@Controller('properties')
export class PropertiesController {
      constructor (private properties: PropertiesService) {}
    @Get('')
    @UseGuards(AuthenticationGuard)

    async getAll(@Req() req: any){
        return this.properties.findAll(req.user.organizationId);
    }
    @Get(':propertyId')
    @UseGuards(AuthenticationGuard)
    async getOne(@Param('propertyId', ParseUUIDPipe) id: string, @Req() req: any){
        const property = await this.properties.findOne(id, req.user.organizationId);
        if (!property)
            throw new NotFoundException('Property not found');
        return property;
    }

    @Post('')
    @UseGuards(AuthenticationGuard)
    async create(@Body() dto: CreatePropertyDto, @Req() req: any){
        return this.properties.create(dto, req.user.organizationId);
    }
    
}
