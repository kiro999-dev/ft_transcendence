import { Controller, Get, UseGuards, Req, NotFoundException, Param} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { PropertiesService } from './properties.service';

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
    async getOne(@Param('propertyId') id: string, @Req() req: any){
        const property = await this.properties.findOne(id, req.user.organizationId);
        if (!property)
            throw new NotFoundException('Property not found');
        return property;
    }
}
