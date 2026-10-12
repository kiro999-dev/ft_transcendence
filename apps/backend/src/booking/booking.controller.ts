import { Body, Controller, Post } from '@nestjs/common';
import { BookingService } from './booking.service'

@Controller('/internal/ai')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}
    @Post('availability')
    getAvailability(@Body() body: unknown) {
        return this.bookingService.getAvailability(body)
    }
}