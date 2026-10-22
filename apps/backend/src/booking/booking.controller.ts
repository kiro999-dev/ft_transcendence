import { Body, Controller, Post, UseGuards,Req } from '@nestjs/common';
import { BookingService } from './booking.service'
import { GetAvailabilityDto } from '../dtos/availability.dto';

@Controller('/internal/ai')
export class BookingController {
    constructor(private readonly bookingService: BookingService) { }
    @Post('availability')
    getAvailability(@Body() body: GetAvailabilityDto,@Req() request:any) {
        const id = request.user.sub;
        return this.bookingService.getAvailability(body)
    }
}