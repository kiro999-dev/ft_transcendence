import { Controller, Get, UseGuards, Req, NotFoundException, Param, ParseUUIDPipe, Post, Body, Patch} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Controller('properties')
export class PropertiesController {
      constructor (private properties: PropertiesService) {}
    @Get('')
    @UseGuards(AuthGuard)

    async getAll(@Req() req: any){
        return this.properties.findAll(req.user.organizationId);
    }

    @Get(':propertyId')
    @UseGuards(AuthGuard)
    async getOne(@Param('propertyId', ParseUUIDPipe) id: string, @Req() req: any){
        const property = await this.properties.findOne(id, req.user.organizationId);
        if (!property)
            throw new NotFoundException('Property not found');
        return property;
    }

    @Post('')
    @UseGuards(AuthGuard)
    async create(@Body() dto: CreatePropertyDto, @Req() req: any){
        return this.properties.create(dto, req.user.organizationId);
    }
    
    @Patch(':propertyId')
    @UseGuards(AuthGuard)
    async update(@Param('propertyId', ParseUUIDPipe) id:string, @Body() dto: UpdatePropertyDto, @Req() req: any){
        const property = await this.properties.update(dto, id, req.user.organizationId);
        if (!property)
            throw new NotFoundException('Property not found');
        return property;
    }
}
