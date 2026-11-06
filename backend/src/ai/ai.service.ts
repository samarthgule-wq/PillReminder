import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GeminiService, ChatHistoryMessage } from './gemini.service.js';
import { SendMessageDto } from './dto/chat.dto.js';
import { CreateConversationDto } from './dto/conversation.dto.js';
import { ToolExecutionContext } from './ai-tools.service.js';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
  ) {}

  /**
   * Process a chat message with full multi-turn conversational memory
   */
  async processMessage(dto: SendMessageDto) {
    const userId = dto.userId || 'pat-101';
    const userRole = dto.userRole || 'patient';
    const context: ToolExecutionContext = { userId, userRole };

    // 1. Resolve or Create Conversation
    let conversationId = dto.conversationId;
    let conversation;

    if (conversationId) {
      conversation = await this.prisma.aiConversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 20, // Limit history window to prevent excessive context
          },
        },
      });

      if (!conversation) {
        throw new NotFoundException(`Conversation ${conversationId} not found.`);
      }

      // Security check: Verify conversation ownership
      if (conversation.userId !== userId) {
        throw new ForbiddenException('Access denied: You do not own this conversation.');
      }
    } else {
      // Auto-generate title from first 40 characters
      const autoTitle = dto.message.length > 40 ? dto.message.slice(0, 40) + '...' : dto.message;
      conversation = await this.prisma.aiConversation.create({
        data: {
          userId,
          userRole,
          title: autoTitle,
        },
        include: { messages: true },
      });
      conversationId = conversation.id;
    }

    // 2. Persist incoming user message
    await this.prisma.aiMessage.create({
      data: {
        conversationId,
        role: 'user',
        content: dto.message,
      },
    });

    // 3. Build history for Gemini
    const history: ChatHistoryMessage[] = (conversation.messages || []).map((m) => ({
      role: m.role as 'user' | 'model' | 'system',
      content: m.content,
    }));

    // 4. Send to Gemini
    const chatResult = await this.geminiService.chat(dto.message, history, context);

    // 5. Persist assistant reply & tool results
    const assistantMessage = await this.prisma.aiMessage.create({
      data: {
        conversationId,
        role: 'model',
        content: chatResult.reply,
        toolCalls: chatResult.toolCalls ? (chatResult.toolCalls as any) : undefined,
        toolResults: chatResult.toolResults ? (chatResult.toolResults as any) : undefined,
      },
    });

    // 6. Touch conversation timestamp
    await this.prisma.aiConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      conversationId,
      messageId: assistantMessage.id,
      reply: chatResult.reply,
      toolCalls: chatResult.toolCalls,
      toolResults: chatResult.toolResults,
      modelUsed: chatResult.modelUsed,
      createdAt: assistantMessage.createdAt,
    };
  }

  /**
   * Process a streaming chat message
   */
  async *processMessageStream(dto: SendMessageDto) {
    const userId = dto.userId || 'pat-101';
    const userRole = dto.userRole || 'patient';
    const context: ToolExecutionContext = { userId, userRole };

    // Resolve or create conversation
    let conversationId = dto.conversationId;
    let conversation;

    if (conversationId) {
      conversation = await this.prisma.aiConversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 20,
          },
        },
      });
      if (!conversation) {
        throw new NotFoundException(`Conversation ${conversationId} not found.`);
      }
    } else {
      const autoTitle = dto.message.length > 40 ? dto.message.slice(0, 40) + '...' : dto.message;
      conversation = await this.prisma.aiConversation.create({
        data: {
          userId,
          userRole,
          title: autoTitle,
        },
        include: { messages: true },
      });
      conversationId = conversation.id;
    }

    // Save user message
    await this.prisma.aiMessage.create({
      data: {
        conversationId,
        role: 'user',
        content: dto.message,
      },
    });

    const history: ChatHistoryMessage[] = (conversation.messages || []).map((m) => ({
      role: m.role as 'user' | 'model' | 'system',
      content: m.content,
    }));

    let accumulatedReply = '';
    let capturedToolResults: any = null;

    // Stream from Gemini
    for await (const chunk of this.geminiService.chatStream(dto.message, history, context)) {
      accumulatedReply += chunk.chunk;
      if (chunk.toolInfo) {
        capturedToolResults = chunk.toolInfo;
      }

      yield {
        conversationId,
        chunk: chunk.chunk,
        isComplete: chunk.isComplete || false,
        toolInfo: chunk.toolInfo,
      };
    }

    // Persist final accumulated model message
    await this.prisma.aiMessage.create({
      data: {
        conversationId,
        role: 'model',
        content: accumulatedReply,
        toolResults: capturedToolResults ? (capturedToolResults as any) : undefined,
      },
    });

    await this.prisma.aiConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  }

  /**
   * Get all conversations for a user
   */
  async getConversations(userId: string = 'pat-101', role?: string) {
    const where: any = { userId };
    if (role) {
      where.userRole = role;
    }

    const conversations = await this.prisma.aiConversation.findMany({
      where,
      include: {
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map((c) => ({
      id: c.id,
      title: c.title,
      userRole: c.userRole,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      messageCount: c._count.messages,
    }));
  }

  /**
   * Get a conversation by ID with full messages
   */
  async getConversationById(id: string, userId: string = 'pat-101') {
    const conversation = await this.prisma.aiConversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${id} not found.`);
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('Access denied: You do not have permission to view this conversation.');
    }

    return conversation;
  }

  /**
   * Create an explicit new conversation
   */
  async createConversation(dto: CreateConversationDto) {
    const userId = dto.userId || 'pat-101';
    const userRole = dto.userRole || 'patient';
    const title = dto.title || `New ${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Session`;

    return await this.prisma.aiConversation.create({
      data: {
        userId,
        userRole,
        title,
      },
    });
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(id: string, userId: string = 'pat-101') {
    const conversation = await this.prisma.aiConversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${id} not found.`);
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('Access denied: You do not have permission to delete this conversation.');
    }

    await this.prisma.aiConversation.delete({
      where: { id },
    });

    return { status: 'success', message: `Conversation ${id} deleted successfully.` };
  }
}
