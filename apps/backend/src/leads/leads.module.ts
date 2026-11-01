import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { CrmLeadsController } from './crm-leads.controller';
import { LeadsService } from './leads.service';
import { AiServiceGuard } from './ai-service.guard';

@Module({
  controllers: [LeadsController, CrmLeadsController],
  providers: [LeadsService, AiServiceGuard],
})
export class LeadsModule {}
