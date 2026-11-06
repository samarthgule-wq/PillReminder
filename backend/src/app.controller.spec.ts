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
      expect(response).toEqual({
        application: 'PillReminder',
        status: 'running',
        database: 'connected',
        message: 'Welcome to PillReminder API!',
      });
    });
  });
});
