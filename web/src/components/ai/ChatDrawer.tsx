'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  X,
  Send,
  Plus,
  Trash2,
  Maximize2,
  RefreshCw,
  Clock,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  sendAiMessage,
  streamAiMessage,
  getAiConversations,
  getAiConversationDetails,
  deleteAiConversation,
  ChatMessage,
  ConversationSummary,
} from '@/services/ai';
import { ChatMessageItem } from './ChatMessageItem';

export interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'patient' | 'doctor' | 'pharmacy' | 'guardian';
  initialUserId?: string;
}

export function ChatDrawer({
  isOpen,
  onClose,
  initialRole = 'patient',
  initialUserId = 'pat-101',
}: ChatDrawerProps) {
  const role = initialRole;
  const userId = initialUserId;

  // Conversation state
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [streamingToolInfo, setStreamingToolInfo] = useState<Array<{ name: string; result: unknown }> | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageCounter = useRef(0);

  const loadConversations = React.useCallback(async () => {
    try {
      const list = await getAiConversations(userId, role);
      setConversations(list);
    } catch {
      // Quiet fail on offline/local startup
    }
  }, [userId, role]);

  // Load conversations on mount or role change asynchronously
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    getAiConversations(userId, role)
      .then((list) => {
        if (isMounted) setConversations(list);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isOpen, userId, role]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isLoading]);

  const handleSelectConversation = async (convId: string) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const details = await getAiConversationDetails(convId, userId);
      setCurrentConversationId(details.id);
      setMessages(details.messages);
      setShowHistory(false);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load conversation history.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewConversation = () => {
    setCurrentConversationId(undefined);
    setMessages([]);
    setStreamingText('');
    setErrorMsg(null);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteAiConversation(convId, userId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (currentConversationId === convId) {
        handleStartNewConversation();
      }
    } catch {
      // Ignore
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage('');
    setErrorMsg(null);

    messageCounter.current += 1;
    const tempUserMsg: ChatMessage = {
      id: `temp-${messageCounter.current}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);
    setStreamingText('');
    setStreamingToolInfo(null);

    let streamCompleted = false;

    try {
      // Attempt SSE streaming first
      await streamAiMessage(
        text,
        {
          conversationId: currentConversationId,
          userRole: role,
          userId,
        },
        {
          onChunk: (chunk, toolInfo) => {
            setStreamingText((prev) => prev + chunk);
            if (toolInfo && Array.isArray(toolInfo)) {
              setStreamingToolInfo(toolInfo as Array<{ name: string; result: unknown }>);
            }
          },
          onComplete: (convId) => {
            streamCompleted = true;
            setCurrentConversationId(convId);
            setStreamingText((finalText) => {
              messageCounter.current += 1;
              const aiMsg: ChatMessage = {
                id: `ai-${messageCounter.current}`,
                role: 'model',
                content: finalText,
                createdAt: new Date().toISOString(),
                toolResults: streamingToolInfo || undefined,
              };
              setMessages((prev) => [...prev, aiMsg]);
              return '';
            });
            setIsLoading(false);
            loadConversations();
          },
          onError: async () => {
            // Fallback to standard request if SSE is interrupted
            if (!streamCompleted) {
              try {
                const res = await sendAiMessage(text, {
                  conversationId: currentConversationId,
                  userRole: role,
                  userId,
                });
                setCurrentConversationId(res.conversationId);
                const aiMsg: ChatMessage = {
                  id: res.messageId,
                  role: 'model',
                  content: res.reply,
                  createdAt: res.createdAt,
                  toolCalls: res.toolCalls,
                  toolResults: res.toolResults,
                };
                setMessages((prev) => [...prev, aiMsg]);
                setIsLoading(false);
                loadConversations();
              } catch (fallbackErr: unknown) {
                setErrorMsg(fallbackErr instanceof Error ? fallbackErr.message : 'Error processing response.');
                setIsLoading(false);
              }
            }
          },
        }
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error communicating with PillReminder AI.');
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Role starter prompts
  const starterPrompts = {
    patient: [
      'What medicines do I need to take today?',
      'When is my next reminder?',
      'Show my active prescriptions.',
      'Did I miss any medicines yesterday?',
    ],
    doctor: [
      'Show my patients.',
      'Which prescriptions have I created recently?',
      'Show adherence for my authorized patients.',
      'Find prescriptions needing review.',
    ],
    pharmacy: [
      'Which medicines are low in stock?',
      'Show pending orders.',
      'Search medicine availability.',
      'Which products are close to expiry?',
    ],
    guardian: [
      'Show my linked family members.',
      'Does my linked family member have pending reminders?',
      'Show recent medication activity for my family.',
    ],
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 sm:inset-auto sm:right-6 sm:bottom-6 z-50 flex flex-col w-full sm:w-[440px] md:w-[480px] h-full sm:h-[620px] max-h-screen sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* 1. Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm tracking-tight">PillReminder AI</h3>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider text-blue-100">
                Gemini
              </span>
            </div>
            <p className="text-[11px] text-blue-100/80">
              Role: <strong className="text-white capitalize">{role}</strong> &bull; PostgreSQL Connected
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-white/90">
          {/* New chat */}
          <button
            onClick={handleStartNewConversation}
            className="p-1.5 hover:bg-white/15 rounded-lg transition"
            title="Start New Conversation"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* History dropdown */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-1.5 hover:bg-white/15 rounded-lg transition relative"
            title="Conversation History"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Full-screen Link */}
          <Link
            href="/ai-assistant"
            className="p-1.5 hover:bg-white/15 rounded-lg transition"
            title="Open Dedicated Full-Screen Assistant"
          >
            <Maximize2 className="w-4 h-4" />
          </Link>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/15 rounded-lg transition"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* History Slide-down panel */}
      {showHistory && (
        <div className="bg-slate-50 border-b border-slate-200 p-3 max-h-56 overflow-y-auto space-y-1.5 shrink-0 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Saved Conversations</span>
            <button
              onClick={handleStartNewConversation}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              + New Session
            </button>
          </div>

          {conversations.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No conversation history found.</p>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => handleSelectConversation(c.id)}
                className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition ${
                  currentConversationId === c.id
                    ? 'bg-blue-100 text-blue-900 font-bold border border-blue-200'
                    : 'bg-white hover:bg-slate-100 border border-slate-200/70 text-slate-700'
                }`}
              >
                <div className="truncate pr-2">
                  <span className="block truncate">{c.title}</span>
                  <span className="text-[10px] text-slate-400">
                    {c.messageCount} messages &bull; {new Date(c.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(c.id, e)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. Messages List Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 text-base tracking-tight">
                Hello! I&rsquo;m PillReminder AI
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Ask me anything about your medication schedule, prescriptions, reminders, pharmacy inventory, or general questions.
              </p>
            </div>

            {/* Starter Prompt Cards */}
            <div className="w-full space-y-2 pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-left">
                Suggested Prompts ({role}):
              </span>
              <div className="grid grid-cols-1 gap-1.5 text-left">
                {starterPrompts[role].map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(p)}
                    className="p-2.5 rounded-xl bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 text-xs text-slate-700 hover:text-blue-900 font-medium transition flex items-center justify-between group shadow-2xs"
                  >
                    <span>{p}</span>
                    <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      &rarr;
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat History */
          <>
            {messages.map((m) => (
              <ChatMessageItem
                key={m.id}
                role={m.role}
                content={m.content}
                createdAt={m.createdAt}
                toolResults={m.toolResults}
              />
            ))}

            {/* Active Streaming Chunk Display */}
            {isLoading && (
              <ChatMessageItem
                role="model"
                content={streamingText || 'Searching clinical records and generating answer...'}
                isStreaming={true}
                toolResults={streamingToolInfo || undefined}
              />
            )}
          </>
        )}

        {/* Error message banner */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Action Required</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Footer / Input Area */}
      <div className="p-3 bg-white border-t border-slate-200/90 shrink-0 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            rows={2}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={`Ask PillReminder AI (${role} context)...`}
            className="flex-1 resize-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white flex items-center justify-center transition shadow-md shadow-blue-600/20 shrink-0"
            title="Send Message (Enter)"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>Press <strong>Enter</strong> to send &bull; <strong>Shift+Enter</strong> for newline</span>
          <span className="flex items-center gap-1 text-slate-500">
            <HelpCircle className="w-3 h-3" />
            Medical records verified via PostgreSQL
          </span>
        </div>
      </div>
    </div>
  );
}
