import { Controller, Get, UseGuards, Req, NotFoundException, Param, ParseUUIDPipe, Post, Body, Query, Patch, Delete } from '@nestjs/common';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { AuthorizationGuard } from '../guards/authorization.guard';
import { ROLES } from '../decorator/roles.decorator';

@Controller('properties')
export class PropertiesController {
      constructor (private properties: PropertiesService) {}
    @Get('')
    @UseGuards(AuthenticationGuard)

    async getAll(@Query() query: QueryPropertyDto, @Req() req: any){
        return this.properties.findAll(req.user.organizationId, query);
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
    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    @ROLES('owner', 'moderator')
    async create(@Body() dto: CreatePropertyDto, @Req() req: any){
        return this.properties.create(dto, req.user.organizationId);
    }
    
    @Patch(':propertyId')
    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    @ROLES('owner', 'moderator')
    async update(@Param('propertyId', ParseUUIDPipe) id:string, @Body() dto: UpdatePropertyDto, @Req() req: any){
        const property = await this.properties.update(dto, id, req.user.organizationId);
        if (!property)
            throw new NotFoundException('Property not found');
        return property;
    }

    @Delete(':propertyId')
    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    @ROLES('owner', 'moderator')
    async archive(@Param('propertyId', ParseUUIDPipe) id: string, @Req() req: any){
        const property = await this.properties.archive(id, req.user.organizationId);
        if (!property)
            throw new NotFoundException('Property not found');
        return property;
    }
}
