'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Clock,
  ArrowLeft,
  User,
  Stethoscope,
  Store,
  HeartHandshake,
  RefreshCw,
  Database,
  AlertCircle,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import {
  sendAiMessage,
  streamAiMessage,
  getAiConversations,
  getAiConversationDetails,
  deleteAiConversation,
  getAiStatus,
  ChatMessage,
  ConversationSummary,
  AiStatusResponse,
} from '@/services/ai';
import { ChatMessageItem } from '@/components/ai/ChatMessageItem';

export default function AiAssistantPage() {
  const [role, setRole] = useState<'patient' | 'doctor' | 'pharmacy' | 'guardian'>('patient');
  const [userId, setUserId] = useState('pat-101');

  // AI & Conversation State
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [streamingToolInfo, setStreamingToolInfo] = useState<Array<{ name: string; result: unknown }> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<AiStatusResponse | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageCounter = useRef(0);

  // Synchronize default user ID when role changes
  const handleRoleChange = (newRole: 'patient' | 'doctor' | 'pharmacy' | 'guardian') => {
    setRole(newRole);
    if (newRole === 'patient') setUserId('pat-101');
    if (newRole === 'doctor') setUserId('doc-001');
    if (newRole === 'pharmacy') setUserId('pharma-001');
    if (newRole === 'guardian') setUserId('guard-001');

    setActiveConversationId(undefined);
    setMessages([]);
    setStreamingText('');
  };

  const loadConversations = React.useCallback(async () => {
    try {
      const list = await getAiConversations(userId, role);
      setConversations(list);
    } catch {
      // Quiet fail if backend warming up
    }
  }, [userId, role]);

  // Load conversations and AI status on mount & role change asynchronously
  useEffect(() => {
    let isMounted = true;

    getAiConversations(userId, role)
      .then((list) => {
        if (isMounted) setConversations(list);
      })
      .catch(() => {});

    getAiStatus()
      .then((st) => {
        if (isMounted) setAiStatus(st);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [userId, role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isLoading]);

  const handleSelectConversation = async (convId: string) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const details = await getAiConversationDetails(convId, userId);
      setActiveConversationId(details.id);
      setMessages(details.messages);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load conversation history.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewConversation = () => {
    setActiveConversationId(undefined);
    setMessages([]);
    setStreamingText('');
    setErrorMsg(null);
    inputRef.current?.focus();
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteAiConversation(convId, userId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConversationId === convId) {
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
      await streamAiMessage(
        text,
        {
          conversationId: activeConversationId,
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
            setActiveConversationId(convId);
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
            if (!streamCompleted) {
              try {
                const res = await sendAiMessage(text, {
                  conversationId: activeConversationId,
                  userRole: role,
                  userId,
                });
                setActiveConversationId(res.conversationId);
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

  const roleConfig = [
    { id: 'patient', label: 'Patient', icon: User, defaultId: 'pat-101' },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, defaultId: 'doc-001' },
    { id: 'pharmacy', label: 'Pharmacy', icon: Store, defaultId: 'pharma-001' },
    { id: 'guardian', label: 'Guardian', icon: HeartHandshake, defaultId: 'guard-001' },
  ];

  const starterPrompts = {
    patient: [
      {
        title: 'Today’s Medications',
        prompt: 'What medicines should I take today and at what times?',
        desc: 'Retrieves today’s scheduled doses, taken pills, and pending reminders.',
      },
      {
        title: 'Next Reminder',
        prompt: 'When is my next medication reminder scheduled?',
        desc: 'Finds your immediate upcoming dose with doctor dosage instructions.',
      },
      {
        title: 'Active Prescriptions',
        prompt: 'Show all my active prescriptions and doctor notes.',
        desc: 'Lists authorized clinical prescriptions, item strengths, and frequencies.',
      },
      {
        title: 'Missed Dose Audit',
        prompt: 'Did I miss or skip any medicines yesterday?',
        desc: 'Reviews self-reported logs from yesterday’s adherence audit.',
      },
    ],
    doctor: [
      {
        title: 'Linked Patient Roster',
        prompt: 'Show my linked patients and their chronic health profiles.',
        desc: 'Reviews patient adherence rates and primary diagnoses.',
      },
      {
        title: 'Recent Prescriptions',
        prompt: 'Which prescriptions have I authored recently?',
        desc: 'Audits active and approved digital prescription orders.',
      },
      {
        title: 'Adherence Summary',
        prompt: 'Show patient adherence metrics for Robert Taylor.',
        desc: 'Inspects verified dose completion percentages.',
      },
      {
        title: 'Prescription Schedule',
        prompt: 'Explain the dosage instructions for prescription PR-89410-26.',
        desc: 'Detailed breakdown of dosage timings, food notes, and contraindications.',
      },
    ],
    pharmacy: [
      {
        title: 'Low Stock Alert',
        prompt: 'Which medicines are currently low in stock or out of stock?',
        desc: 'Queries inventory records for items with quantity <= 10.',
      },
      {
        title: 'Pending Orders Queue',
        prompt: 'Show pending pharmacy orders requiring review or pickup.',
        desc: 'Audits unfulfilled orders awaiting pharmacist verification.',
      },
      {
        title: 'Medicine Search',
        prompt: 'Search availability for Metformin HCl ER 500mg in inventory.',
        desc: 'Checks quantity in stock, batch number, and unit price.',
      },
      {
        title: 'Order Fulfillment',
        prompt: 'Show order history and fulfillment status for recent orders.',
        desc: 'Returns customer pickups, deliveries, and payment status.',
      },
    ],
    guardian: [
      {
        title: 'Linked Family Members',
        prompt: 'Show my linked family members and authorized consent levels.',
        desc: 'Reviews patient-authorized caregiver relationships.',
      },
      {
        title: 'Pending Family Reminders',
        prompt: 'Does my linked family member have any pending doses today?',
        desc: 'Verifies whether loved ones have acknowledged their medication schedule.',
      },
      {
        title: 'Recent Activity Feed',
        prompt: 'Show recent medication activity for my authorized family members.',
        desc: 'Logs self-reported taken doses, refill urgency, and caregiver notifications.',
      },
      {
        title: 'Refill Check',
        prompt: 'Are any of my family members close to running out of medication?',
        desc: 'Audits remaining medication days based on prescription schedule.',
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* 1. Top Global Navigation Bar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            title="Back to PillReminder Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base text-slate-900 tracking-tight">
                  PillReminder AI
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {aiStatus?.configuredModel || 'gemini-2.5-flash'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Intelligent Medical Assistant &bull; PostgreSQL Connected &bull; Multi-Turn Memory
              </p>
            </div>
          </div>
        </div>

        {/* Role Switcher in Header */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center p-1 bg-slate-100 rounded-xl">
            {roleConfig.map((r) => {
              const Icon = r.icon;
              const isSelected = role === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleRoleChange(r.id as 'patient' | 'doctor' | 'pharmacy' | 'guardian')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    isSelected
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleStartNewConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content Layout (Sidebar + Chat Arena) */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full overflow-hidden">
        {/* Left Sidebar (Sessions History) */}
        <aside className="w-72 border-r border-slate-200/80 bg-white p-4 hidden md:flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Saved Sessions
              </span>
              <span className="text-[11px] text-slate-400">{conversations.length}</span>
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-250px)]">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 space-y-1">
                  <p>No prior conversations.</p>
                  <p className="text-[11px]">Ask a question to start your first session.</p>
                </div>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConversation(c.id)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition ${
                      activeConversationId === c.id
                        ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200 shadow-2xs'
                        : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="block truncate">{c.title}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {c.messageCount} messages &bull; {new Date(c.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(c.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 rounded transition"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Assistant Architecture Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-[11px]">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Real-Time Clinical Records</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Every user-specific query executes secure backend function calls against PostgreSQL. No records are ever hallucinated.
            </p>
          </div>
        </aside>

        {/* Center Chat Arena */}
        <main className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-50/50">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 max-w-4xl mx-auto w-full">
            {messages.length === 0 ? (
              /* Welcome Screen */
              <div className="py-8 sm:py-12 flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Sparkles className="w-8 h-8" />
                </div>

                <div className="space-y-2 max-w-lg">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Hello! I&rsquo;m PillReminder AI
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Your conversational healthcare assistant powered by <strong>Google Gemini</strong>. Ask me anything about your medication schedule, digital prescriptions, dose reminders, pharmacy stock, or general medicine questions.
                  </p>
                </div>

                {/* Role Switcher for Mobile */}
                <div className="flex md:hidden items-center p-1 bg-slate-200/70 rounded-xl">
                  {roleConfig.map((r) => {
                    const isSelected = role === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => handleRoleChange(r.id as 'patient' | 'doctor' | 'pharmacy' | 'guardian')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          isSelected ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>

                {/* Suggested Prompts Cards */}
                <div className="w-full pt-4 space-y-3 text-left">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="uppercase tracking-wider">
                      Suggested Prompts for {role.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-blue-600 font-semibold">Live Database Verified</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {starterPrompts[role].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(item.prompt)}
                        className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition text-left space-y-1.5 group cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-xs text-slate-700 font-medium leading-snug">
                          &ldquo;{item.prompt}&rdquo;
                        </p>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          {item.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Conversation Messages Stream */
              <div className="space-y-4">
                {messages.map((m) => (
                  <ChatMessageItem
                    key={m.id}
                    role={m.role}
                    content={m.content}
                    createdAt={m.createdAt}
                    toolResults={m.toolResults}
                  />
                ))}

                {isLoading && (
                  <ChatMessageItem
                    role="model"
                    content={streamingText || 'Accessing PostgreSQL database and generating clinical response...'}
                    isStreaming={true}
                    toolResults={streamingToolInfo || undefined}
                  />
                )}
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <span className="font-bold block text-sm">Notice</span>
                  <p>{errorMsg}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Prompt Input */}
          <div className="border-t border-slate-200 bg-white p-4 sm:p-5 shrink-0">
            <div className="max-w-4xl mx-auto space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-end gap-2.5"
              >
                <textarea
                  ref={inputRef}
                  rows={2}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder={`Ask PillReminder AI anything (${role} workspace)...`}
                  className="flex-1 resize-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="h-12 w-12 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white flex items-center justify-center transition shadow-md shadow-blue-600/25 shrink-0"
                  title="Send Prompt (Enter)"
                >
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>
                  Press <strong>Enter</strong> to send &bull; <strong>Shift+Enter</strong> for newline
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Health advice is informational. Consult your clinician for medical evaluation.
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
