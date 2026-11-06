'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Menu,
  Sparkles,
} from 'lucide-react';
import { BackendStatusBadge } from './BackendStatusBadge';

interface PortalHeaderProps {
  portalName: string;
  userName: string;
  userRole: string;
  userAvatarLetter: string;
  onMobileMenuToggle?: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
}

export function PortalHeader({
  portalName,
  userName,
  userRole,
  userAvatarLetter,
  onMobileMenuToggle,
  searchPlaceholder = 'Search records, medicines...',
  searchValue = '',
  onSearchChange,
}: PortalHeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      type: 'info',
      title: 'Prescription Automated',
      desc: 'Schedule generated for prescription PR-89410-26.',
      time: '12m ago',
    },
    {
      id: 2,
      type: 'warning',
      title: 'Refill Warning',
      desc: 'Atorvastatin Calcium stock is below 5 doses.',
      time: '1h ago',
    },
    {
      id: 3,
      type: 'success',
      title: 'Database Synchronized',
      desc: 'NestJS backend and PostgreSQL connected.',
      time: 'Just now',
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 md:px-6 backdrop-blur-sm">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {onSearchChange ? (
          <div className="relative w-full max-w-xs md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-800"
            />
          </div>
        ) : (
          <div className="hidden sm:block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {portalName}
            </span>
          </div>
        )}
      </div>

      {/* Right: Backend Status, Notifications, Profile */}
      <div className="flex items-center gap-2.5 md:gap-3.5">
        <Link
          href="/ai-assistant"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition shadow-2xs"
          title="Open PillReminder AI"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span>Ask AI</span>
        </Link>

        <BackendStatusBadge />

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            onBlur={() => setTimeout(() => setNotificationsOpen(false), 200)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white p-3 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 text-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                  3 New
                </span>
              </div>
              <div className="mt-2 divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {notifications.map((item) => (
                  <div key={item.id} className="py-2 px-1 hover:bg-slate-50 rounded-lg transition text-left">
                    <div className="flex items-start gap-2">
                      {item.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />}
                      {item.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />}
                      {item.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />}
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800">{item.title}</p>
                        <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{item.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            onBlur={() => setTimeout(() => setProfileOpen(false), 200)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition group text-left"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              {userAvatarLetter}
            </div>
            <div className="hidden lg:block">
              <div className="text-xs font-bold text-slate-800 leading-none group-hover:text-blue-600">
                {userName}
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">{userRole}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 text-slate-700">
              <div className="p-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">{userName}</div>
                <div className="text-[11px] text-slate-500">{userRole}</div>
              </div>

              <div className="py-1">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition"
                >
                  <User className="w-3.5 h-3.5" />
                  Account Settings
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition"
                >
                  Exit to Homepage
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
