
import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { LeadsService } from './leads.service';
import { AiServiceGuard } from './ai-service.guard';

@Controller('internal/ai/leads')
@UseGuards(AiServiceGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  private getOrganizationId(value?: string): string {
    if (!value || !isUUID(value)) {
      throw new BadRequestException('Valid X-Organization-Id is required');
    }
    return value;
  }

  @Get('phone')
  findByPhone(
    @Headers('x-organization-id') organizationId: string,
    @Query('phone') phone: string,
  ) {
    if (!phone?.trim()) {
      throw new BadRequestException('Phone is required');
    }

    return this.leadsService.findByPhone(
      this.getOrganizationId(organizationId),
      phone.trim(),
    );
  }

  @Post()
  create(
    @Headers('x-organization-id') organizationId: string,
    @Body() body: Record<string, any>,
  ) {
    return this.leadsService.create(
      this.getOrganizationId(organizationId),
      body,
    );
  }

  @Patch(':id')
  update(
    @Headers('x-organization-id') organizationId: string,
    @Param('id') id: string,
    @Body() body: Record<string, any>,
  ) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid lead ID');
    }

    return this.leadsService.update(
      this.getOrganizationId(organizationId),
      id,
      body,
    );
  }

  @Post(':id/matches')
  saveMatches(
    @Headers('x-organization-id') organizationId: string,
    @Param('id') id: string,
    @Body() body: { matches: Array<{
      propertyId: string;
      matchScore?: number;
      reason?: string;
    }> },
  ) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid lead ID');
    }

    return this.leadsService.saveMatches(
      this.getOrganizationId(organizationId),
      id,
      body?.matches,
    );
  }
}
