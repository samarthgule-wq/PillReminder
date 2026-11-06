import React from 'react';
import Link from 'next/link';
import { Pill, Shield, Heart, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Pill className="w-5 h-5 -rotate-45" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Pill<span className="text-blue-400">Reminder</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              An integrated medication management ecosystem connecting doctors, patients, pharmacies, and family caregivers.
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" /> Secure Architecture
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-red-400" /> Patient-Centered
              </span>
            </div>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Portals
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/doctor" className="hover:text-blue-400 transition">
                  Doctor Portal
                </Link>
              </li>
              <li>
                <Link href="/patient" className="hover:text-blue-400 transition">
                  Patient Portal
                </Link>
              </li>
              <li>
                <Link href="/pharmacy" className="hover:text-blue-400 transition">
                  Pharmacy Marketplace
                </Link>
              </li>
              <li>
                <Link href="/guardian" className="hover:text-blue-400 transition">
                  Family Guardian
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#features" className="hover:text-blue-400 transition">
                  Digital Prescriptions
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-blue-400 transition">
                  Prescription-to-Reminder
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-blue-400 transition">
                  QR Prescription References
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-blue-400 transition">
                  Refill Radar
                </Link>
              </li>
            </ul>
          </div>

          {/* Authentication & Health */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Access & System
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-blue-400 transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-blue-400 transition">
                  Create Account
                </Link>
              </li>
              <li>
                <a
                  href="http://localhost:4000/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-blue-400 transition"
                >
                  Backend API Health
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Medical disclaimer & copyright */}
        <div className="mt-10 pt-6 border-t border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>
            &copy; {new Date().getFullYear()} PillReminder Healthcare Technologies. All rights reserved.
          </p>
          <p className="max-w-xl text-center md:text-right text-[11px] text-slate-400">
            Important Medical Notice: Medication dosages, schedules, and clinical recommendations must
            always be approved by a licensed medical practitioner. Self-reported adherence records are
            for tracking and informational purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
