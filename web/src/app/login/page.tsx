'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Pill,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Stethoscope,
  User,
  Store,
  HeartHandshake,
  Info,
} from 'lucide-react';
import { BackendStatusBadge } from '@/components/layout/BackendStatusBadge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [role, setRole] = useState<'doctor' | 'patient' | 'pharmacy' | 'guardian'>('patient');
  const [email, setEmail] = useState('patient.demo@pillreminder.health');
  const [password, setPassword] = useState('DemoSecure123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = [
    { id: 'patient', label: 'Patient', icon: User, defaultEmail: 'patient.demo@pillreminder.health', route: '/patient' },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, defaultEmail: 'dr.jenkins@stjude.health', route: '/doctor' },
    { id: 'pharmacy', label: 'Pharmacy', icon: Store, defaultEmail: 'orders@carepoint.pharmacy', route: '/pharmacy' },
    { id: 'guardian', label: 'Guardian', icon: HeartHandshake, defaultEmail: 'michael.guardian@family.care', route: '/guardian' },
  ];

  const handleRoleChange = (newRole: 'doctor' | 'patient' | 'pharmacy' | 'guardian') => {
    setRole(newRole);
    const found = roles.find((r) => r.id === newRole);
    if (found) {
      setEmail(found.defaultEmail);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const target = roles.find((r) => r.id === role)?.route || '/patient';
      toast({
        type: 'success',
        title: 'Authentication Successful',
        message: `Welcome back to the ${role.toUpperCase()} workspace. Entering portal...`,
      });
      router.push(target);
    }, 600);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    toast({
      type: 'info',
      title: 'Reset Link Sent',
      message: `Password reset verification email dispatched to ${forgotEmail}.`,
    });
    setIsForgotModalOpen(false);
    setForgotEmail('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800">
      {/* Top Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-sm py-3.5 px-4 sm:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Pill className="w-4 h-4 -rotate-45" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
            Pill<span className="text-blue-600">Reminder</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <BackendStatusBadge compact />
          <Link
            href="/register"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Create an Account &rarr;
          </Link>
        </div>
      </header>

      {/* Main Login Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign In to PillReminder
            </h1>
            <p className="text-xs text-slate-500">
              Select your portal role to access your healthcare dashboard.
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl">
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleChange(r.id as typeof role)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[11px] font-bold transition ${
                    isSelected
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@healthcare.org"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-900 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-900 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-600">Remember this session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-75 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-xs"
            >
              {isSubmitting ? 'Authenticating...' : `Enter ${role.charAt(0).toUpperCase() + role.slice(1)} Portal`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Privacy Disclaimer */}
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-600">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Demonstration Mode: Logging in seamlessly directs you into the selected portal with live backend diagnostics enabled.
            </p>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/80">
        &copy; {new Date().getFullYear()} PillReminder Healthcare Technologies.
      </footer>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Password"
        description="Enter your registered account email to receive recovery instructions."
        maxWidth="sm"
      >
        <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Registered Email
            </label>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              placeholder="e.g. robert.taylor@example.com"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
            >
              Send Reset Link
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
