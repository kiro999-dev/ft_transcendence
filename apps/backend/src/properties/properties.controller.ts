import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';

@Controller('properties')
export class PropertiesController {
    @Get('')
    @UseGuards(AuthGuard)
    getAll():string{
        return "properties is work";
    }
}
