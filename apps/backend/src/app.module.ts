import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; 
import { TokensModule } from './tokens/tokens.module';
import { EmailModule } from './email/email/email.module';
import { OrganizationService } from './organization/organization.service';
import { OrganizationModule } from './organization/organization.module';
@Module({
  controllers: [AppController],
  providers: [AppService, OrganizationService],
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
   
    TokensModule,
    EmailModule,
    OrganizationModule
  ],
})
export class AppModule {}
