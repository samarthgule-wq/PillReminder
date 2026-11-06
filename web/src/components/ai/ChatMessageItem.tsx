'use client';

import React, { useState } from 'react';
import { Copy, Check, Sparkles, Database, User } from 'lucide-react';

export interface ChatMessageItemProps {
  role: 'user' | 'model';
  content: string;
  createdAt?: string;
  toolResults?: Array<{ name: string; result: unknown }>;
  isStreaming?: boolean;
}

export function ChatMessageItem({
  role,
  content,
  createdAt,
  toolResults,
  isStreaming,
}: ChatMessageItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Format simple markdown into styled elements
  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      // Headings
      if (line.startsWith('#### ')) {
        return (
          <h4 key={idx} className="font-bold text-slate-900 text-xs mt-2 mb-1">
            {formatInlineText(line.replace('#### ', ''))}
          </h4>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="font-bold text-slate-900 text-sm mt-3 mb-1.5 flex items-center gap-1.5">
            {formatInlineText(line.replace('### ', ''))}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="font-bold text-slate-900 text-base mt-3 mb-2">
            {formatInlineText(line.replace('## ', ''))}
          </h2>
        );
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="border-l-2 border-blue-500 bg-blue-50/60 text-slate-700 text-xs px-2.5 py-1.5 rounded-r-lg my-1.5 italic"
          >
            {formatInlineText(line.replace('> ', ''))}
          </blockquote>
        );
      }

      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const bulletText = line.trim().replace(/^[-*]\s+/, '');
        return (
          <li key={idx} className="text-xs text-slate-700 ml-4 list-disc my-0.5 leading-relaxed">
            {formatInlineText(bulletText)}
          </li>
        );
      }

      // Empty lines
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Standard paragraph
      return (
        <p key={idx} className="text-xs text-slate-700 leading-relaxed my-1">
          {formatInlineText(line)}
        </p>
      );
    });
  };

  // Helper for bold, code, and highlights
  const formatInlineText = (str: string) => {
    // Split by markdown bold **...** and inline code `...`
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-slate-100 text-blue-700 font-mono text-[11px] border border-slate-200"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const isUser = role === 'user';

  return (
    <div className={`flex items-start gap-3 my-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar Icon */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Message Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Header label */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[11px] font-bold text-slate-800">
            {isUser ? 'You' : 'PillReminder AI'}
          </span>
          {createdAt && (
            <span className="text-[10px] text-slate-400">
              {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Database Tool Badges (if any function calls executed) */}
        {!isUser && toolResults && toolResults.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {toolResults.map((t, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-semibold"
              >
                <Database className="w-3 h-3 text-blue-600" />
                Retrieved from PostgreSQL: {t.name.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 shadow-xs ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-none'
              : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
          }`}
        >
          {isUser ? (
            <p className="text-xs leading-relaxed whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="space-y-0.5">
              {renderFormattedContent(content)}
              {isStreaming && (
                <span className="inline-block w-2 h-3 ml-1 bg-blue-600 animate-pulse rounded-xs" />
              )}
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        {!isUser && content && !isStreaming && (
          <div className="flex items-center gap-2 mt-1 px-1">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-green-600" />
                  <span className="text-green-600 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
