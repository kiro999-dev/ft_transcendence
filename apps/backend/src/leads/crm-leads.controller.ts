import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { LeadsService } from './leads.service';

@Controller('leads')
@UseGuards(AuthenticationGuard)
export class CrmLeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.leadsService.findAll(req.user.organizationId);
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const { lead } = await this.leadsService.create(req.user.organizationId, body);
    return lead;
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    const { lead } = await this.leadsService.update(req.user.organizationId, id, body);
    return lead;
  }
}
