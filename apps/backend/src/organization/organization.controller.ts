import { Controller, Get, UseGuards, Req, NotFoundException, Body, Post } from '@nestjs/common';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { OrganizationService } from './organization.service';
import { StaffUserDto } from '../dtos/StaffUserDto';
import { AuthorizationGuard } from '../guards/authorization.guard';
import { ROLES } from '../decorator/roles.decorator';
@Controller('organization')
export class OrganizationController {
    constructor(private orgService: OrganizationService) { }
    @UseGuards(AuthenticationGuard)
    @Get('')
    async getOrganization(@Req() req: any) {
        const orgId = req.user.organizationId
        const org = await this.orgService.getOrganizationById(orgId);
        if (!org)
            throw new NotFoundException("Organization Not found");
        return {
            organization_name: org.name
        }
    }
    @UseGuards(AuthenticationGuard)
    @Post('/add-user')
    async addUserToOrganization(@Body() StaffUser:StaffUserDto,@Req() req: any)
    {
        const orgId = req.user.organizationId
        return this.orgService.addUserToOrganization(StaffUser,orgId);
    }

    @ROLES('owner')
    @UseGuards(AuthenticationGuard,AuthorizationGuard)
    @Post('/delete-user')
    async removeUserOrganization(@Body() email:any,@Req() req: any)
    {
        const orgId = req.user.organizationId
        return this.orgService.removeUserOrganization(orgId,email.email); // should have a dto
    }
    @UseGuards(AuthenticationGuard)
    @Get("/users")
    async getOrganizationUsers(@Req() req: any)
    {
         const orgId = req.user.organizationId
         return this.orgService.getOrganizationUsers(orgId)
    }
}
