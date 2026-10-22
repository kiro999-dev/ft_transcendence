import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service'
import { GetAvailabilityDto } from '../dtos/availability.dto';
import { AuthenticationGuard } from '../guards/authentication.guard';

@UseGuards(AuthenticationGuard)
@Controller('/internal/ai')
export class BookingController {
    constructor(private readonly bookingService: BookingService) { }
    @Post('availability')
    getAvailability(@Body() body: GetAvailabilityDto) {
        return this.bookingService.getAvailability(body)
    }
}