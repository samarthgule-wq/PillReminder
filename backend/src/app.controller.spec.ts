import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';

describe('AppController', () => {
  let appController: AppController;
  let prismaService: Partial<PrismaService>;

  beforeEach(async () => {
    prismaService = {
      checkHealth: vi.fn().mockResolvedValue(true),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('should return health status payload', async () => {
      const response = await appController.getHealth();
      expect(response.application).toBe('PillReminder');
      expect(response.status).toBe('running');
      expect(response.database).toBe('connected');
      expect(response.message).toBe('PillReminder API is healthy');
      expect(typeof response.timestamp).toBe('string');
    });

    it('should return 503 status when database is disconnected', async () => {
      prismaService.checkHealth = vi.fn().mockResolvedValue(false);
      const mockRes = { status: vi.fn() } as any;
      const response = await appController.getHealth(mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(response.status).toBe('degraded');
      expect(response.database).toBe('disconnected');
    });
  });
});
