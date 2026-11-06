'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { ChatDrawer } from './ChatDrawer';

export function FloatingAiButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Don't render floating button if user is already on the dedicated full-screen /ai-assistant page
  if (pathname === '/ai-assistant') {
    return null;
  }

  // Detect current active portal role from route
  let role: 'patient' | 'doctor' | 'pharmacy' | 'guardian' = 'patient';
  let userId = 'pat-101';

  if (pathname.startsWith('/doctor')) {
    role = 'doctor';
    userId = 'doc-001';
  } else if (pathname.startsWith('/pharmacy')) {
    role = 'pharmacy';
    userId = 'pharma-001';
  } else if (pathname.startsWith('/guardian')) {
    role = 'guardian';
    userId = 'guard-001';
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-blue-600/30 hover:shadow-blue-600/45 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 border border-white/20"
          aria-label="Open PillReminder AI Assistant"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="tracking-tight">PillReminder AI</span>
          <span className="hidden sm:inline-block text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-semibold uppercase text-blue-100">
            {role}
          </span>

          {/* Pulse ring notification */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>
        </button>
      </div>

      <ChatDrawer
        key={`${role}-${userId}`}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialRole={role}
        initialUserId={userId}
      />
    </>
  );
}
