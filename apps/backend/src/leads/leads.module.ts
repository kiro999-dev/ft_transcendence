import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { AiServiceGuard } from './ai-service.guard';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, AiServiceGuard],
})
export class LeadsModule {}