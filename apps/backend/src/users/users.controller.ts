import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '../guards/authentication.guard';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from '../dtos/updateProfile.dto';
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
        return await this.userService.updateUserProfile(newProfileData,req.user.sub)
     }

}
