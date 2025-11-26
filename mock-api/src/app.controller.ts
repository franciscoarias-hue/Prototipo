import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post('pay')
  processPayment(@Body() body: any) {
    const { card } = body;
    if (card && card.number && card.number.endsWith('1')) {
      return { status: 'declined' };
    }
    return { status: 'approved' };
  }
}
