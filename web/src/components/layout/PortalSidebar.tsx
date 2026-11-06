'use client';

import React from 'react';
import Link from 'next/link';
import {
  Pill,
  Stethoscope,
  User,
  Store,
  HeartHandshake,
  ArrowLeft,
  X,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

interface PortalSidebarProps {
  portalId: 'doctor' | 'patient' | 'pharmacy' | 'guardian';
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function PortalSidebar({
  portalId,
  navItems,
  activeTab,
  onTabChange,
  isOpenMobile = false,
  onCloseMobile,
}: PortalSidebarProps) {
  const portals = [
    { id: 'doctor', name: 'Doctor Portal', href: '/doctor', icon: Stethoscope, color: 'text-blue-600 bg-blue-50' },
    { id: 'patient', name: 'Patient Portal', href: '/patient', icon: User, color: 'text-blue-600 bg-blue-50' },
    { id: 'pharmacy', name: 'Pharmacy Marketplace', href: '/pharmacy', icon: Store, color: 'text-blue-600 bg-blue-50' },
    { id: 'guardian', name: 'Family Guardian', href: '/guardian', icon: HeartHandshake, color: 'text-blue-600 bg-blue-50' },
  ];

  const currentPortal = portals.find((p) => p.id === portalId);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-all">
            <Pill className="w-4 h-4 -rotate-45" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              Pill<span className="text-blue-600">Reminder</span>
            </span>
          </div>
        </Link>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Current Portal Card */}
      <div className="p-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
          {currentPortal && (
            <div className={`p-2 rounded-lg ${currentPortal.color}`}>
              <currentPortal.icon className="w-4 h-4" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Active Portal
            </p>
            <p className="text-xs font-bold text-slate-900 truncate">
              {currentPortal?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Workspace Navigation
        </p>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Portal Switcher */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Switch Portal View
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {portals.map((p) => {
            const isThisPortal = p.id === portalId;
            const Icon = p.icon;
            return (
              <Link
                key={p.id}
                href={p.href}
                className={`flex items-center gap-1.5 p-2 rounded-lg text-[11px] font-semibold transition ${
                  isThisPortal
                    ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{p.name.replace(' Portal', '').replace(' Marketplace', '')}</span>
              </Link>
            );
          })}
        </div>

        <Link
          href="/"
          className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Homepage
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-20">
        {sidebarContent}
      </aside>

      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
