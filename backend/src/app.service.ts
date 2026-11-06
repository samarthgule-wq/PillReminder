import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

export interface HealthResponse {
  application: string;
  status: string;
  database: string;
  message: string;
}

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth(): Promise<HealthResponse> {
    const isDbConnected = await this.prisma.checkHealth();
    return {
      application: 'PillReminder',
      status: 'running',
      database: isDbConnected ? 'connected' : 'disconnected',
      message: 'Welcome to PillReminder API!',
    };
  }
}
