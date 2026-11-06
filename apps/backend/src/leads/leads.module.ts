import { Module } from '@nestjs/common';
import { CrmLeadsController } from './crm-leads.controller';
import { LeadsService } from './leads.service';

@Module({
  controllers: [CrmLeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
