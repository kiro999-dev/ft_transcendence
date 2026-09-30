import { Body, Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthenticationGuard } from './guards/authentication.guard';
interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    organizationId: string | null;
    role: string;
    iat: number;
    exp: number;
  };
}
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  
  @Get()
  @UseGuards(AuthenticationGuard)
  getHello(@Req() req:AuthenticatedRequest ): any {
   
    return `you login mr ${req.user.sub}`
  }
}
