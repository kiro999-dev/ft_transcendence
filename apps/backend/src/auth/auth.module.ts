import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokensModule } from '../tokens/tokens.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports:[
    TokensModule,
    UsersModule
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
