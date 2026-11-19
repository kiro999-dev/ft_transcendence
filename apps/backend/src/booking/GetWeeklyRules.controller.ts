import { Controller, Get, Put, Query, UseGuards, Body, Post, Param, Delete, Req, ParseUUIDPipe } from '@nestjs/common';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { GetWeeklyRulesService } from './GetWeeklyRules.service';
import { SetWeeklyAvailabilityDto } from '../dtos/GetWeeklyRules.dto';
import { CreateCalendarExceptionDto } from '../dtos/CalendarException.Dto';

@UseGuards(AuthenticationGuard)
@Controller('api/availability')
export class GetWeeklyRulesController {
    constructor(private readonly availabilityService: GetWeeklyRulesService) {}

    @Get('rules')
    async getRules(@Query('userId', ParseUUIDPipe) userId: string, @Req() req: any) {
        return this.availabilityService.getWeeklyRules(userId, req.user);
    }

    @Put('rules')
    async setRules(@Body() dto: SetWeeklyAvailabilityDto, @Req() req: any) {
        return this.availabilityService.setWeeklyRules(dto, req.user);
    }

    @Get('exceptions')
    async getExceptions(@Query('userId', ParseUUIDPipe) userId: string, @Req() req: any) {
        return this.availabilityService.getCalendarExceptions(userId, req.user);
    }

    @Post('exceptions')
    async createException(@Body() dto: CreateCalendarExceptionDto, @Req() req: any) {
        return this.availabilityService.createException(dto, req.user);
    }

    @Delete('exceptions/:id')
    async deleteException(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
        return this.availabilityService.deleteException(id, req.user);
    }
}
