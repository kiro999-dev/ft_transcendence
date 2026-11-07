import { Controller, Get, Put, Query, UseGuards, Body, Post, Param, Delete } from '@nestjs/common';
import { BookingService } from './booking.service';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { GetAvailabilityDto } from '../dtos/availability.dto';
import { GetWeeklyRulesService } from './GetWeeklyRules.service';
import { SetWeeklyAvailabilityDto } from '../dtos/GetWeeklyRules.dto';
import { CreateCalendarExceptionDto } from '../dtos/CalendarException.Dto'

// @UseGuards(AuthenticationGuard)
@Controller('api/availability')
export class GetWeeklyRulesController {
    constructor(private readonly availabilityService: GetWeeklyRulesService) {}
    @Get('rules')
    async getRules(@Query('userId') userId: string) {
        return this.availabilityService.getWeeklyRules(userId);
    }

    @Put('rules')
    async setRules(@Body() dto: SetWeeklyAvailabilityDto) {
        return this.availabilityService.setWeeklyRules(dto);
    }

    @Get('exceptions')
    async getExceptions(@Query('userId') userId: string) {
        return this.availabilityService.getCalendarExceptions(userId);
    }
    @Post('exceptions')
    async createException(@Body() dto: CreateCalendarExceptionDto)
    {
        return this.availabilityService.createException(dto)
    }
    @Delete('exceptions/:id')
    async deleteException(@Param('id') id: string)
    {
        return this.availabilityService.deleteException(id);
    }
}