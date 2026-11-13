
import { GetAvailabilityDto } from '../dtos/availability.dto';
import { VisitDto } from '../dtos/visit.dto';
import { AuthenticationGuard } from '../guards/authentication.guard';

import { Controller, Post, Body, Headers, BadRequestException, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { RescheduleVisitDto } from '../dtos/rescheduleVisit.dto';

@UseGuards(AuthenticationGuard)
@Controller('internal/ai')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('availability')
  getAvailability(@Body() body: GetAvailabilityDto) {
    return this.bookingService.getAvailability(body);
  }
  @Post('visits')
  create(
    @Headers('x-organization-id') organizationId: string,
    @Body() createVisitDto: VisitDto,
  ) {
    if (!organizationId) {
      throw new BadRequestException('X-Organization-Id header is required');
    }
    return this.bookingService.createVisitFromAI(createVisitDto, organizationId);
  }
  @Get('visits')
  getVisits() {
    return this.bookingService.getVisits();
  }
  @Patch('visits/:id/reschedule')
  reschedule( @Param('id') id: string, @Body() body: RescheduleVisitDto) {
    return this.bookingService.rescheduleVisit(id, body.starts_at);
  }
  @Patch('/visits/:id/cancel')
  cancel(@Param('id') id: string) {
    return this.bookingService.cancelVisit(id);
  }
}