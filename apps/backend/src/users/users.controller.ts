import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from '../dtos/updateProfile.dto';
import { ROLES } from '../decorator/roles.decorator';
import { AuthorizationGuard } from '../guards/authorization.guard';
import { request } from 'http';
@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { }
    @UseGuards(AuthenticationGuard)
    @Get("me")
    async getProfile(@Req()req:any) {
        const userId = req.user.sub
        const user = await this.userService.findUserbyId(userId);

        if (!user) {
            throw new NotFoundException("User not found");
        }
        return {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            role: user.role,
            organization_id: user.organization_id,
        };
    }
     @UseGuards(AuthenticationGuard)
     @Patch('me')
     async updateProfile(@Body() newProfileData:UpdateProfileDto,@Req() req:any)
     {
        return this.userService.updateUserProfile(newProfileData,req.user.sub)
     }
     @ROLES('admin')
     @UseGuards(AuthenticationGuard,AuthorizationGuard)
     @Get('')
     listUsers(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number)
     {
        return this.userService.listAllUsers(page,20);
     }
    @ROLES('admin')
     @UseGuards(AuthenticationGuard,AuthorizationGuard)
     @Delete(':id')
     deleteUser(@Param('id') id:string,@Req() request:any)
     {
        const userid = request.user.sub;
        this.userService.deleteUser(id,userid);
     }

}
