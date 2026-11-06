import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AiService } from './ai.service.js';

describe('AiService', () => {
  let service: AiService;
  let mockPrisma: any;
  let mockGeminiService: any;

  beforeEach(() => {
    mockPrisma = {
      aiConversation: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      aiMessage: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    };

    mockGeminiService = {
      chat: vi.fn(),
    };

    service = new AiService(mockPrisma, mockGeminiService);
  });

  it('should create conversation when not provided and save messages', async () => {
    mockPrisma.aiConversation.create.mockResolvedValue({
      id: 'conv-123',
      userId: 'pat-101',
      userRole: 'patient',
      title: 'What medicines should I take today?',
      messages: [],
    });

    mockPrisma.aiMessage.create.mockResolvedValue({
      id: 'msg-456',
      conversationId: 'conv-123',
      role: 'model',
      content: 'Here are your medicines for today: Amlodipine at 8:00 AM.',
      createdAt: new Date(),
    });

    mockPrisma.aiConversation.update.mockResolvedValue({});

    mockGeminiService.chat.mockResolvedValue({
      reply: 'Here are your medicines for today: Amlodipine at 8:00 AM.',
      modelUsed: 'gemini-2.5-flash',
    });

    const res = await service.processMessage({
      message: 'What medicines should I take today?',
      userRole: 'patient',
      userId: 'pat-101',
    });

    expect(res.conversationId).toBe('conv-123');
    expect(res.reply).toContain('Amlodipine');
    expect(mockPrisma.aiConversation.create).toHaveBeenCalled();
    expect(mockPrisma.aiMessage.create).toHaveBeenCalledTimes(2); // user msg + model reply
  });

  it('should retrieve conversation history with ownership validation', async () => {
    mockPrisma.aiConversation.findUnique.mockResolvedValue({
      id: 'conv-123',
      userId: 'pat-101',
      userRole: 'patient',
      title: 'Prior Session',
      messages: [
        { id: 'm1', role: 'user', content: 'Hello' },
        { id: 'm2', role: 'model', content: 'Hi Robert, how can I assist you today?' },
      ],
    });

    const conversation = await service.getConversationById('conv-123', 'pat-101');
    expect(conversation.id).toBe('conv-123');
    expect(conversation.messages.length).toBe(2);
  });

  it('should reject access if another user attempts to read conversation', async () => {
    mockPrisma.aiConversation.findUnique.mockResolvedValue({
      id: 'conv-123',
      userId: 'pat-101', // Owned by pat-101
      userRole: 'patient',
    });

    await expect(service.getConversationById('conv-123', 'pat-999')).rejects.toThrow(
      'Access denied: You do not have permission to view this conversation.',
    );
  });
});
