import { Controller, Get, UseGuards, Req, NotFoundException, Body, Post, Delete } from '@nestjs/common';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { OrganizationService } from './organization.service';
import { StaffUserDto } from '../dtos/StaffUserDto';
import { AuthorizationGuard } from '../guards/authorization.guard';
import { ROLES } from '../decorator/roles.decorator';
import { UseremailDto } from '../dtos/userEmail.dto';
@Controller('organization')
export class OrganizationController {
    constructor(private orgService: OrganizationService) { }
    @UseGuards(AuthenticationGuard,AuthorizationGuard)
    @Get('all')
    @ROLES('admin')
    async getAllOrganizations()
    {
        return this.orgService.getAllOrganizations()
    }
    @ROLES('admin')
    @UseGuards(AuthenticationGuard,AuthorizationGuard)
    @Delete('delete-organization')
    async deleteOrganization(@Body() OrgId:any)
    {
        this.orgService.deleteOrganization(OrgId.id)
        return {
            message:"Organization  has been deleted"
        }
    }
    @UseGuards(AuthenticationGuard)
    @Get('us')
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
    async removeUserOrganization(@Body() Useremail:UseremailDto,@Req() req: any)
    {
        const orgId = req.user.organizationId
        return this.orgService.removeUserOrganization(orgId,Useremail.email); 
    }
    @UseGuards(AuthenticationGuard)
    @Get("/users")
    async getOrganizationUsers(@Req() req: any)
    {
         const orgId = req.user.organizationId
         return this.orgService.getOrganizationUsers(orgId)
    }
}
