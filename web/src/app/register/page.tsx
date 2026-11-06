'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Pill,
  User,
  Stethoscope,
  Store,
  HeartHandshake,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import { BackendStatusBadge } from '@/components/layout/BackendStatusBadge';
import { useToast } from '@/components/ui/Toast';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [role, setRole] = useState<'patient' | 'doctor' | 'pharmacy' | 'guardian'>('patient');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Role-specific fields
  const [medicalLicense, setMedicalLicense] = useState('');
  const [specialty, setSpecialty] = useState('Cardiology');
  const [pharmacyLicense, setPharmacyLicense] = useState('');
  const [relationship, setRelationship] = useState('Parent');
  const [emergencyContact, setEmergencyContact] = useState('');

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = [
    { id: 'patient', label: 'Patient', icon: User, route: '/patient' },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, route: '/doctor' },
    { id: 'pharmacy', label: 'Pharmacy', icon: Store, route: '/pharmacy' },
    { id: 'guardian', label: 'Guardian', icon: HeartHandshake, route: '/guardian' },
  ];

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        type: 'error',
        title: 'Password Mismatch',
        message: 'The confirmation password does not match your entered password.',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        type: 'warning',
        title: 'Weak Password',
        message: 'Password should be at least 8 characters with numbers or symbols.',
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        type: 'warning',
        title: 'Terms Required',
        message: 'Please review and accept the healthcare privacy consent terms.',
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const target = roles.find((r) => r.id === role)?.route || '/patient';
      toast({
        type: 'success',
        title: 'Account Created Successfully',
        message: `Welcome to PillReminder, ${fullName}! Initializing your ${role.toUpperCase()} workspace...`,
      });
      router.push(target);
    }, 700);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800">
      {/* Header */}
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
            href="/login"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Already have an account? Sign In &rarr;
          </Link>
        </div>
      </header>

      {/* Main Registration Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Create Your PillReminder Account
            </h1>
            <p className="text-xs text-slate-500">
              Join the medication management network connecting clinicians, patients, and pharmacies.
            </p>
          </div>

          {/* Account Type Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
              Choose Your Account Type:
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id as typeof role)}
                    className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-xs font-bold transition ${
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
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            {/* Common fields */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sarah Jenkins or Robert Taylor"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Role-specific dynamic fields */}
            {role === 'doctor' && (
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-3">
                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide block">
                  Medical Licensing Verification
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Medical License # *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MD-98214-NY"
                      value={medicalLicense}
                      onChange={(e) => setMedicalLicense(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Specialty</label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="Internal Medicine">Internal Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Pulmonology">Pulmonology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Geriatrics">Geriatrics</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {role === 'pharmacy' && (
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-3">
                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide block">
                  Dispensary Registration
                </span>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Pharmacy State Board License *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PH-STATE-2026-88"
                    value={pharmacyLicense}
                    onChange={(e) => setPharmacyLicense(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {role === 'guardian' && (
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-3">
                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide block">
                  Caregiver Relationship Declaration
                </span>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Relationship to Member</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Parent">Parent</option>
                    <option value="Child">Child (Son/Daughter)</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Professional Caregiver">Professional Caregiver</option>
                  </select>
                </div>
              </div>
            )}

            {role === 'patient' && (
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-3">
                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide block">
                  Safety &amp; Emergency Information
                </span>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Emergency Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +1 (555) 998-1122 (Michael - Son)"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Password fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Create Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Consent agreement checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="termsCheck"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="termsCheck" className="text-[11px] text-slate-600 leading-snug cursor-pointer">
                I agree to the <strong>Patient Consent Framework</strong> and acknowledge that medication adherence
                logs are self-reported and do not replace consultation with a licensed practitioner.
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-75 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-xs"
            >
              {isSubmitting ? 'Creating Profile...' : `Register & Launch ${role.charAt(0).toUpperCase() + role.slice(1)} Portal`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/80">
        &copy; {new Date().getFullYear()} PillReminder Healthcare Technologies.
      </footer>
    </div>
  );
}
