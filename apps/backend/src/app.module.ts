import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; 
@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    AuthModule, 
    UsersModule, 
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
   
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global:true,
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET') 
      }),
    }),
  ],
})
export class AppModule {}
