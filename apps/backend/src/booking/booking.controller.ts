import { Body, Controller, Post, Get, Patch, Param, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { BookingService } from './booking.service'
import { GetAvailabilityDto } from '../dtos/availability.dto';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { VisitDto } from '../dtos/visit.dto';
import { RescheduleVisitDto } from '../dtos/rescheduleVisit.dto';

@Controller('/internal/ai')
export class BookingController {
    constructor(private readonly bookingService: BookingService) { }
    @Post('availability')
    @UseGuards(AuthenticationGuard)
    getAvailability(@Body() body: GetAvailabilityDto,@Req() request:any) {
        const organizationId = request.user.organizationId;
        return this.bookingService.getAvailability(body, organizationId)
    }
    @Post('visits')
    @UseGuards(AuthenticationGuard)
    createVisit(@Body() body: VisitDto, @Req() request: any) {
        return this.bookingService.createVisit(body, request.user.organizationId);
    }
    @Get('visits')
    @UseGuards(AuthenticationGuard)
    getVisits(@Req() request: any) {
        return this.bookingService.getVisits(request.user.organizationId);
    }
    @Patch('visits/:id/reschedule')
    @UseGuards(AuthenticationGuard)
    reschedule(@Param('id', ParseUUIDPipe) id: string, @Body() body: RescheduleVisitDto, @Req() request: any) {
        return this.bookingService.rescheduleVisit(id, body.starts_at, request.user);
    }
    @Patch('visits/:id/cancel')
    @UseGuards(AuthenticationGuard)
    cancel(@Param('id', ParseUUIDPipe) id: string, @Req() request: any) {
        return this.bookingService.cancelVisit(id, request.user);
    }

}
