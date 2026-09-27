import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokensModule } from '../tokens/tokens.module';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email/email.module';
import { EmailService } from '../email/email/email.service';

@Module({
  imports:[
    TokensModule,
    UsersModule,
    EmailModule
  ],
  controllers: [AuthController],
  providers: [AuthService,EmailService]
})
export class AuthModule {}
