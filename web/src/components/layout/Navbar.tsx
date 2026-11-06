'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Pill, Menu, X, ArrowRight, Stethoscope, User, Store, HeartHandshake, Sparkles } from 'lucide-react';
import { BackendStatusBadge } from './BackendStatusBadge';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-all">
                <Pill className="w-5 h-5 -rotate-45" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  Pill<span className="text-blue-600">Reminder</span>
                </span>
                <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                  Healthcare Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200">
              <Link
                href="/#features"
                className="px-3 py-1.5 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="px-3 py-1.5 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                How It Works
              </Link>

              {/* Portals Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setPortalsDropdownOpen(!portalsDropdownOpen)}
                  onBlur={() => setTimeout(() => setPortalsDropdownOpen(false), 200)}
                  className="px-3 py-1.5 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1"
                >
                  Portals
                  <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {portalsDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-64 rounded-2xl bg-white p-2 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95">
                    <Link
                      href="/doctor"
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 text-slate-800 hover:text-blue-700 transition"
                    >
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Doctor Portal</div>
                        <div className="text-[10px] text-slate-500">Digital Rx & patient charts</div>
                      </div>
                    </Link>

                    <Link
                      href="/patient"
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 text-slate-800 hover:text-blue-700 transition"
                    >
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Patient Portal</div>
                        <div className="text-[10px] text-slate-500">Dosage schedule & alerts</div>
                      </div>
                    </Link>

                    <Link
                      href="/pharmacy"
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 text-slate-800 hover:text-blue-700 transition"
                    >
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Pharmacy Marketplace</div>
                        <div className="text-[10px] text-slate-500">Inventory & fulfillment</div>
                      </div>
                    </Link>

                    <Link
                      href="/guardian"
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 text-slate-800 hover:text-blue-700 transition"
                    >
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <HeartHandshake className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Family Guardian</div>
                        <div className="text-[10px] text-slate-500">Consent-based monitoring</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/#about"
                className="px-3 py-1.5 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                About
              </Link>

              <Link
                href="/ai-assistant"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span>AI Assistant</span>
              </Link>
            </nav>
          </div>

          {/* Right Side: Backend Status + Auth Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <BackendStatusBadge />

            <Link
              href="/login"
              className="text-sm font-bold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-xl transition hover:bg-slate-100"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <BackendStatusBadge compact />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            <Link
              href="/doctor"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-blue-50 rounded-xl text-blue-800 text-xs font-bold flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4 text-blue-600" /> Doctor Portal
            </Link>
            <Link
              href="/patient"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-blue-50 rounded-xl text-blue-800 text-xs font-bold flex items-center gap-2"
            >
              <User className="w-4 h-4 text-blue-600" /> Patient Portal
            </Link>
            <Link
              href="/pharmacy"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-blue-50 rounded-xl text-blue-800 text-xs font-bold flex items-center gap-2"
            >
              <Store className="w-4 h-4 text-blue-600" /> Pharmacy
            </Link>
            <Link
              href="/guardian"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-blue-50 rounded-xl text-blue-800 text-xs font-bold flex items-center gap-2"
            >
              <HeartHandshake className="w-4 h-4 text-blue-600" /> Guardian
            </Link>
          </div>

          <div className="space-y-1">
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
            >
              How It Works
            </Link>
            <Link
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
            >
              About
            </Link>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
