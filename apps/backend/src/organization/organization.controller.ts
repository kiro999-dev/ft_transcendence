import { Controller, Get, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { OrganizationService } from './organization.service';

@Controller('organization')
export class OrganizationController {
    constructor (private orgService:OrganizationService){}
    @UseGuards(AuthGuard)
    @Get('')
    async getOrganization(@Req() req: any) {
        const orgId = req.user.organizationId
        const org = await this.orgService.getOrganizationById(orgId);
        if(!org)
            throw new NotFoundException("Organization Not found");
        return {
            organization_name:org.name
        }
  }
}
