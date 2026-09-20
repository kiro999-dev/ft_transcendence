import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports:[
    UsersModule
  ],
  providers: [TokensService],
  exports: [TokensService]
})
export class TokensModule {}
