import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // 1. Import ConfigService

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
      useFactory: async (configService: ConfigService) => ({
        global:true,
        secret: configService.get<string>('SECRET') 
      }),
    }),
  ],
})
export class AppModule {}
