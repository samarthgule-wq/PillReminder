import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Stethoscope,
  User,
  Store,
  HeartHandshake,
  QrCode,
  BellRing,
  CalendarCheck,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  Database,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BackendStatusBadge } from '@/components/layout/BackendStatusBadge';
import { API_BASE_URL } from '@/services/api';

export default function HomePage() {
  const portalCards = [
    {
      id: 'doctor',
      name: 'Doctor Portal',
      role: 'For Physicians & Clinicians',
      description:
        'Create compliant digital prescriptions, configure patient-specific reminder schedules, and monitor adherence securely.',
      icon: Stethoscope,
      href: '/doctor',
      badge: 'Clinical Workspace',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      features: ['Digital Rx Builder', 'Dosage Scheduling', 'Secure QR Generation'],
    },
    {
      id: 'patient',
      name: 'Patient Portal',
      role: 'For Individuals & Patients',
      description:
        'Receive automated medication schedules directly from doctor prescriptions. Acknowledge doses with Taken, Snooze, or Skip.',
      icon: User,
      href: '/patient',
      badge: 'Daily Companion',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      features: ['Smart Reminders', 'Medicine Vault', 'Refill Radar'],
    },
    {
      id: 'pharmacy',
      name: 'Pharmacy Marketplace',
      role: 'For Licensed Dispensaries',
      description:
        'Manage medicine inventory with stock freshness tracking, verify digital prescriptions, and fulfill patient pickup orders.',
      icon: Store,
      href: '/pharmacy',
      badge: 'Fulfillment & Rx',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      features: ['Real-time Inventory', 'Order Verification', 'Price Transparency'],
    },
    {
      id: 'guardian',
      name: 'Family Guardian',
      role: 'For Authorized Caregivers',
      description:
        'Consent-based caregiver portal to assist elderly or vulnerable family members, track adherence, and oversee timely refills.',
      icon: HeartHandshake,
      href: '/guardian',
      badge: 'Consent-Based Care',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      features: ['Adherence Monitoring', 'Missed Dose Alerts', 'Refill Oversight'],
    },
  ];

  const features = [
    {
      title: 'Digital Prescriptions',
      description:
        'Doctors generate tamper-evident electronic prescriptions with explicit strengths, frequency, instructions, and duration.',
      icon: FileText,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Prescription-to-Reminder Automation',
      description:
        'No manual transcription errors. Approved prescriptions automatically synthesize into intelligent patient reminder alarms.',
      icon: CalendarCheck,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Smart Medication Reminders',
      description:
        'Patients receive clear notifications and self-report their adherence using simple Taken, Snooze, or Skip options.',
      icon: BellRing,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'QR Prescriptions',
      description:
        'Secure QR references for seamless pharmacy verification without exposing raw patient medical data inside the code.',
      icon: QrCode,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Pharmacy Marketplace',
      description:
        'Discover participating pharmacies, check stock freshness, compare medicine pricing, and request convenient store pickups.',
      icon: Store,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Family Guardian',
      description:
        'Authorized family members can monitor adherence alerts under a strict patient consent model to prevent missed doses.',
      icon: HeartHandshake,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'Medication History & Vault',
      description:
        'A comprehensive record of self-reported acknowledgements, past courses, refill thresholds, and dosage schedules.',
      icon: Clock,
      color: 'text-green-600 bg-green-50',
    },
    {
      title: 'AI Prescription Scanner',
      description:
        'Assisted OCR extraction module helping clinicians and pharmacists verify legacy paper prescriptions against the formulary.',
      icon: Sparkles,
      color: 'text-blue-600 bg-blue-50',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Doctor Creates Prescription',
      desc: 'The physician selects medications, configures dosages, and defines the tailored reminder schedule during consultation.',
    },
    {
      step: '02',
      title: 'Patient Receives Prescription',
      desc: "The approved digital prescription appears instantly in the patient's PillReminder account with complete clinical notes.",
    },
    {
      step: '03',
      title: 'Medication Schedule Generated',
      desc: 'Our engine automatically transforms the prescription parameters into scheduled daily reminder alerts.',
    },
    {
      step: '04',
      title: 'Patient Receives Reminders',
      desc: 'Timely notifications alert the patient when it is time to take each medication with food/water instructions.',
    },
    {
      step: '05',
      title: 'Patient Acknowledges Doses',
      desc: 'The patient marks doses as Taken, Snoozes if busy, or Skips with an optional reason, maintaining an adherence log.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-white via-blue-50/40 to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Live Backend Connection Chip */}
            <div className="inline-flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white border border-slate-200 shadow-xs">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold tracking-wide uppercase border border-blue-200">
                <Activity className="w-3 h-3 text-blue-600" /> Live Backend
              </span>
              <BackendStatusBadge compact />
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Your Prescription.{' '}
              <span className="text-blue-600">
                Your Reminders.
              </span>{' '}
              Your Health.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              Connect doctors, patients, pharmacies, and families through one intelligent medication
              management platform. Eliminating manual schedule entry with automated prescription-to-reminder workflows.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02]"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#portals"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm shadow-xs transition"
              >
                Explore Portals
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-600" /> Zero Manual Schedule Typing
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-600" /> Self-Reported Adherence
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-600" /> Verified Pharmacy Stock
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section id="portals" className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Integrated Ecosystem
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Four Dedicated Portals. One Platform.
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Select your role to access tailored clinical tools, patient adherence dashboards, or pharmacy inventory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portalCards.map((portal) => {
              const Icon = portal.icon;
              return (
                <div
                  key={portal.id}
                  className="group relative flex flex-col justify-between bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-xl transition-all duration-300"
                >
                  <div>
                    {/* Portal Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${portal.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${portal.badgeColor}`}>
                        {portal.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {portal.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mb-2">{portal.role}</p>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{portal.description}</p>

                    <div className="space-y-1.5 mb-6">
                      {portal.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={portal.href}
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white border border-slate-200 group-hover:border-blue-600 shadow-xs transition-all"
                  >
                    Launch {portal.name.replace(' Portal', '').replace(' Marketplace', '')}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Seamless Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              From Doctor Prescription to Patient Adherence
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Eliminating the major pain point where patients struggle to manually input complex schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {workflowSteps.map((step, idx) => (
              <div
                key={step.step}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl font-black text-slate-300 tracking-tight mb-2 block">
                    {step.step}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mb-1.5">{step.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
                {idx < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-slate-200 text-slate-500 rounded-full p-1 shadow-xs">
                    <ChevronRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Platform Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Intelligent Healthcare Architecture
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Engineered with modern TypeScript, NestJS, Prisma, and PostgreSQL for enterprise reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 hover:bg-blue-50/40 border border-slate-200 transition-all hover:border-blue-200 hover:shadow-xs"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 ${feature.color} border border-blue-100`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{feature.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Backend Connection Diagnostic Banner */}
      <section id="about" className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Full-Stack Connection Active</h3>
                <p className="text-xs text-slate-300 max-w-xl mt-0.5">
                  The frontend is integrated with the running NestJS backend at{' '}
                  <code className="text-blue-300 font-mono text-[11px] bg-blue-900/40 px-1.5 py-0.5 rounded">
                    {API_BASE_URL}
                  </code>{' '}
                  and PostgreSQL database container.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <BackendStatusBadge />
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

