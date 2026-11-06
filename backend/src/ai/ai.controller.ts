import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Res,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';
import { AiService } from './ai.service.js';
import { SendMessageDto } from './dto/chat.dto.js';
import { CreateConversationDto, QueryConversationsDto } from './dto/conversation.dto.js';

@Controller('ai')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Diagnostic status endpoint
   */
  @Get('status')
  getStatus() {
    const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_actual_gemini_api_key';
    return {
      status: 'operational',
      assistant: 'PillReminder AI',
      provider: 'Google Gemini API',
      configuredModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      geminiApiKeyConfigured: hasKey,
      streamingSupported: true,
      databasePersistence: 'PostgreSQL Prisma ORM',
    };
  }

  /**
   * Standard Non-Streaming Chat Endpoint
   */
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: SendMessageDto) {
    return await this.aiService.processMessage(dto);
  }

  /**
   * Real-time Server-Sent Events (SSE) Streaming Chat Endpoint
   */
  @Post('chat/stream')
  async chatStream(@Body() dto: SendMessageDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      for await (const chunk of this.aiService.processMessageStream(dto)) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      res.write(`data: ${JSON.stringify({ error: error?.message || 'Streaming error' })}\n\n`);
      res.end();
    }
  }

  /**
   * List Conversations
   */
  @Get('conversations')
  async getConversations(@Query() query: QueryConversationsDto) {
    return await this.aiService.getConversations(query.userId, query.userRole);
  }

  /**
   * Create New Conversation
   */
  @Post('conversations')
  async createConversation(@Body() dto: CreateConversationDto) {
    return await this.aiService.createConversation(dto);
  }

  /**
   * Get Conversation Details & Messages
   */
  @Get('conversations/:id')
  async getConversationById(
    @Param('id') id: string,
    @Query('userId') userId?: string,
  ) {
    return await this.aiService.getConversationById(id, userId || 'pat-101');
  }

  /**
   * Delete Conversation
   */
  @Delete('conversations/:id')
  async deleteConversation(
    @Param('id') id: string,
    @Query('userId') userId?: string,
  ) {
    return await this.aiService.deleteConversation(id, userId || 'pat-101');
  }
}
