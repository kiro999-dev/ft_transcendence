import { Controller, Get, UseGuards, Req, NotFoundException, Body, Post, Delete, Param, ParseUUIDPipe } from '@nestjs/common';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { OrganizationService } from './organization.service';
import { StaffUserDto } from '../dtos/StaffUserDto';
import { AuthorizationGuard } from '../guards/authorization.guard';
import { ROLES } from '../decorator/roles.decorator';
import { UseremailDto } from '../dtos/userEmail.dto';
@Controller('organization')
export class OrganizationController {
    constructor(private orgService: OrganizationService) { }
    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    @Get('all')
    @ROLES('admin')
    async getAllOrganizations() {
        return this.orgService.getAllOrganizations()
    }
    @ROLES('admin')
    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    @Delete(':id')
    async deleteOrganization(@Param('id', ParseUUIDPipe) id: string) {
        await this.orgService.deleteOrganization(id)
        return { message: 'Organization has been deleted' }
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
    @ROLES('owner')
    @UseGuards(AuthenticationGuard,AuthorizationGuard)
    @Post('/users')
    async addUserToOrganization(@Body() StaffUser: StaffUserDto, @Req() req: any) {
        const orgId = req.user.organizationId
        return this.orgService.addUserToOrganization(StaffUser, orgId);
    }

    @ROLES('owner')
    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    @Delete('users/:id')
    removeUser(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
        return this.orgService.removeUserOrganization(req.user.organizationId, id)
    }
    @UseGuards(AuthenticationGuard)
    @Get("/users")
    async getOrganizationUsers(@Req() req: any) {
        const orgId = req.user.organizationId
        return this.orgService.getOrganizationUsers(orgId)
    }
}
