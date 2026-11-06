import { Controller, Get } from '@nestjs/common';
import { AppService, HealthResponse } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth(): Promise<HealthResponse> {
    return this.appService.getHealth();
  }
}
