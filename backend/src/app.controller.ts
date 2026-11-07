import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppService, HealthResponse } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth(@Res({ passthrough: true }) res?: Response): Promise<HealthResponse> {
    const health = await this.appService.getHealth();
    if (res) {
      res.status(health.database === 'connected' ? 200 : 503);
    }
    return health;
  }
}
