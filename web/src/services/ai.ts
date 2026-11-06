import { API_BASE_URL, ApiError } from './api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
  toolCalls?: Array<{ name: string; args: Record<string, unknown> }>;
  toolResults?: Array<{ name: string; result: unknown }>;
}

export interface ConversationSummary {
  id: string;
  title: string;
  userRole: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface SendMessageOptions {
  conversationId?: string;
  userRole?: 'patient' | 'doctor' | 'pharmacy' | 'guardian';
  userId?: string;
}

export interface AiStatusResponse {
  status: string;
  assistant: string;
  provider: string;
  configuredModel: string;
  geminiApiKeyConfigured: boolean;
  streamingSupported: boolean;
  databasePersistence: string;
}

/**
 * Send chat message (standard JSON response)
 */
export async function sendAiMessage(
  message: string,
  options: SendMessageOptions = {}
): Promise<{
  conversationId: string;
  messageId: string;
  reply: string;
  toolCalls?: Array<{ name: string; args: Record<string, unknown> }>;
  toolResults?: Array<{ name: string; result: unknown }>;
  modelUsed: string;
  createdAt: string;
}> {
  const url = `${API_BASE_URL}/ai/chat`;
  const body = {
    message,
    conversationId: options.conversationId,
    userRole: options.userRole || 'patient',
    userId: options.userId || 'pat-101',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, `Failed to send message: ${errorText}`);
  }

  return await response.json();
}

/**
 * Stream chat message using Server-Sent Events (SSE)
 */
export async function streamAiMessage(
  message: string,
  options: SendMessageOptions,
  callbacks: {
    onChunk: (chunk: string, toolInfo?: unknown) => void;
    onComplete: (conversationId: string) => void;
    onError: (error: Error) => void;
  }
): Promise<() => void> {
  const url = `${API_BASE_URL}/ai/chat/stream`;
  const controller = new AbortController();

  const body = {
    message,
    conversationId: options.conversationId,
    userRole: options.userRole || 'patient',
    userId: options.userId || 'pat-101',
    stream: true,
  };

  (async () => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let convId = options.conversationId || '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const dataPayload = trimmed.slice(5).trim();
          if (dataPayload === '[DONE]') {
            callbacks.onComplete(convId);
            return;
          }

          try {
            const parsed = JSON.parse(dataPayload);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.conversationId) {
              convId = parsed.conversationId;
            }
            if (parsed.chunk) {
              callbacks.onChunk(parsed.chunk, parsed.toolInfo);
            }
          } catch {
            // Ignore parse errors on partial frames
          }
        }
      }

      callbacks.onComplete(convId);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        callbacks.onError(err);
      } else if (!(err instanceof Error)) {
        callbacks.onError(new Error('Unknown streaming failure'));
      }
    }
  })();

  // Return abort cancellation function
  return () => controller.abort();
}

/**
 * Retrieve user conversations
 */
export async function getAiConversations(
  userId: string = 'pat-101',
  role?: string
): Promise<ConversationSummary[]> {
  const query = new URLSearchParams({ userId });
  if (role) query.set('userRole', role);

  const res = await fetch(`${API_BASE_URL}/ai/conversations?${query.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new ApiError(res.status, 'Failed to fetch conversations');
  return await res.json();
}

/**
 * Retrieve conversation details with full message history
 */
export async function getAiConversationDetails(
  id: string,
  userId: string = 'pat-101'
): Promise<{
  id: string;
  title: string;
  userRole: string;
  messages: ChatMessage[];
}> {
  const res = await fetch(`${API_BASE_URL}/ai/conversations/${id}?userId=${userId}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new ApiError(res.status, 'Failed to fetch conversation details');
  return await res.json();
}

/**
 * Delete a conversation
 */
export async function deleteAiConversation(
  id: string,
  userId: string = 'pat-101'
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/ai/conversations/${id}?userId=${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new ApiError(res.status, 'Failed to delete conversation');
}

/**
 * Get AI Assistant Diagnostic Status
 */
export async function getAiStatus(): Promise<AiStatusResponse> {
  const res = await fetch(`${API_BASE_URL}/ai/status`, { cache: 'no-store' });
  if (!res.ok) throw new ApiError(res.status, 'Failed to fetch AI status');
  return await res.json();
}
