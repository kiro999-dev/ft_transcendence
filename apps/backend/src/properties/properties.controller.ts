import { Controller, Get, UseGuards, Req } from '@nestjs/common';
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
}
