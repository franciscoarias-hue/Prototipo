import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/payments-db'),
    HttpModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
