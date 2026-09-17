import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller';
import { AppService } from './app.service';



@Module({
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
