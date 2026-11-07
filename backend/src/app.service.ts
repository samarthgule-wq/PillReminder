import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

export interface HealthResponse {
  application: string;
  status: 'running' | 'degraded' | 'down';
  database: 'connected' | 'disconnected' | 'error';
  timestamp: string;
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
      status: isDbConnected ? 'running' : 'degraded',
      database: isDbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      message: isDbConnected
        ? 'PillReminder API is healthy'
        : 'PostgreSQL database connection unavailable',
    };
  }
}
