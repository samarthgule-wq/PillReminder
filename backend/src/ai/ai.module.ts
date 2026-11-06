import { Module } from '@nestjs/common';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';
import { GeminiService } from './gemini.service.js';
import { AiToolsService } from './ai-tools.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [AiService, GeminiService, AiToolsService],
  exports: [AiService, GeminiService, AiToolsService],
})
export class AiModule {}
