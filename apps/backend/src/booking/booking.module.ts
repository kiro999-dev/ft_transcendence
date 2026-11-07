import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { GetWeeklyRulesController } from './GetWeeklyRules.controller';
import { GetWeeklyRulesService } from './GetWeeklyRules.service';

@Module({
  controllers: [
    BookingController,
    GetWeeklyRulesController,
  ],
  providers: [
    BookingService,
    GetWeeklyRulesService,
  ],
})
export class BookingModule {}
