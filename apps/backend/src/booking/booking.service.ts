import { Injectable, Body} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}
  getAvailability(@Body() body: unknown) {
        return "Availability endpoint works"
    }
}
