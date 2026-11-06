'use client';

import React, { useState } from 'react';
import {
  CalendarCheck,
  Clock,
  FileText,
  Package,
  History,
  Store,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Info,
  Sparkles,
} from 'lucide-react';
import { PortalSidebar, NavItem } from '@/components/layout/PortalSidebar';
import { PortalHeader } from '@/components/layout/PortalHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  INITIAL_TODAY_REMINDERS,
  MOCK_PRESCRIPTIONS,
  MOCK_VAULT_ITEMS,
  MOCK_HISTORY_LOGS,
  MOCK_PHARMACIES,
} from '@/lib/mock-data';
import { MedicationReminder, MedicationVaultItem } from '@/types/medication';
import { Prescription } from '@/types/prescription';

export default function PatientPortalPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('today');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Patient reminders interactive state
  const [reminders, setReminders] = useState<MedicationReminder[]>(INITIAL_TODAY_REMINDERS);
  const [timeFilter, setTimeFilter] = useState<'All' | 'Morning' | 'Afternoon' | 'Evening' | 'Night'>('All');

  // Modals state
  const [skipReminderId, setSkipReminderId] = useState<string | null>(null);
  const [skipReason, setSkipReason] = useState('Away from home');
  const [viewingRx, setViewingRx] = useState<Prescription | null>(null);
  const [refillModalItem, setRefillModalItem] = useState<MedicationVaultItem | null>(null);

  const navItems: NavItem[] = [
    { id: 'today', label: "Today's Schedule", icon: CalendarCheck, badge: reminders.filter((r) => r.status === 'pending').length },
    { id: 'vault', label: 'Medicine Vault', icon: Package },
    { id: 'prescriptions', label: 'My Prescriptions', icon: FileText, badge: MOCK_PRESCRIPTIONS.length },
    { id: 'history', label: 'Adherence History', icon: History },
    { id: 'refill', label: 'Refill Radar', icon: AlertTriangle, badge: MOCK_VAULT_ITEMS.filter((v) => v.needsRefill).length },
    { id: 'pharmacy', label: 'Pharmacy Discovery', icon: Store },
  ];

  // ACTION: Mark dose as Taken
  const handleMarkTaken = (id: string, name: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setReminders((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'taken', acknowledgedAt: timeNow } : item
      )
    );
    toast({
      type: 'success',
      title: 'Dose Recorded: Taken',
      message: `${name} logged as taken at ${timeNow} (Self-reported).`,
    });
  };

  // ACTION: Snooze dose (30 minutes)
  const handleSnooze = (id: string, name: string) => {
    setReminders((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'snoozed', snoozedUntil: '+30 mins' } : item
      )
    );
    toast({
      type: 'warning',
      title: 'Reminder Snoozed',
      message: `${name} snoozed. Next notification will trigger in 30 minutes.`,
    });
  };

  // ACTION: Skip dose
  const handleConfirmSkip = () => {
    if (!skipReminderId) return;
    const item = reminders.find((r) => r.id === skipReminderId);
    setReminders((prev) =>
      prev.map((r) =>
        r.id === skipReminderId ? { ...r, status: 'skipped', skipReason } : r
      )
    );
    toast({
      type: 'info',
      title: 'Dose Logged as Skipped',
      message: `${item?.medicineName} skipped (${skipReason}). Noted in physician adherence record.`,
    });
    setSkipReminderId(null);
  };

  // Filtered today reminders
  const filteredReminders = reminders.filter((r) => {
    const matchesSlot = timeFilter === 'All' || r.timeSlot === timeFilter;
    const matchesSearch =
      r.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.instructions.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSlot && matchesSearch;
  });

  const takenCount = reminders.filter((r) => r.status === 'taken').length;
  const pendingCount = reminders.filter((r) => r.status === 'pending').length;
  const completionPercentage = Math.round((takenCount / reminders.length) * 100);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <PortalSidebar
        portalId="patient"
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <PortalHeader
          portalName="Patient Health Portal"
          userName="Robert Taylor"
          userRole="Patient &bull; ID #pat-101"
          userAvatarLetter="RT"
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          searchPlaceholder="Search my medications, schedule, pharmacies..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Welcome back, Robert
                </h1>
                <Badge variant="success" size="sm">
                  Active Care Plan
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Your daily medication schedule is automatically generated from your doctor&rsquo;s prescriptions.
              </p>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px]">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Acknowledgements are <strong>self-reported</strong> to preserve personal privacy.
              </span>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Today's Medications"
              value={reminders.length}
              subtitle={`${takenCount} of ${reminders.length} doses taken`}
              icon={CalendarCheck}
              colorScheme="blue"
            />
            <MetricCard
              title="Upcoming Doses"
              value={pendingCount}
              subtitle="Scheduled for later today"
              icon={Clock}
              colorScheme="blue"
            />
            <MetricCard
              title="Active Prescriptions"
              value={MOCK_PRESCRIPTIONS.length}
              subtitle="From Dr. Sarah Jenkins"
              icon={FileText}
              colorScheme="secondary"
            />
            <MetricCard
              title="Adherence Rate"
              value={`${completionPercentage}%`}
              subtitle="Today's completion"
              icon={CheckCircle2}
              trend={{ value: '94% Weekly', isPositive: true }}
              colorScheme="green"
            />
          </div>

          {/* TAB 1: TODAY'S SCHEDULE */}
          {activeTab === 'today' && (
            <div className="space-y-6">
              {/* Daily Briefing Card */}
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-slate-900 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Daily Briefing
                    </span>
                    <h3 className="text-xl font-bold tracking-tight">
                      {pendingCount === 0
                        ? 'All medication doses completed for today! 🎉'
                        : `You have ${pendingCount} remaining dose${pendingCount > 1 ? 's' : ''} to take today.`}
                    </h3>
                    <p className="text-xs text-blue-100/90 max-w-xl">
                      Next upcoming dose: <strong>Metformin HCl ER (500 mg)</strong> at 07:30 PM with your evening meal.
                    </p>
                  </div>

                  <div className="w-full md:w-56 bg-white/15 p-3 rounded-xl backdrop-blur-xs border border-white/20">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Schedule Progress</span>
                      <span>{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-white h-full transition-all duration-500 rounded-full"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-blue-100 mt-1 block">
                      {takenCount} completed &bull; {pendingCount} pending
                    </span>
                  </div>
                </div>
              </div>

              {/* Today Schedule List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Today&rsquo;s Dosage Schedule</h3>
                    <p className="text-xs text-slate-500">
                      Select Taken after consuming your medication, or Snooze if delayed.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['All', 'Morning', 'Afternoon', 'Evening', 'Night'] as const).map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setTimeFilter(slot)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${
                          timeFilter === slot
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {filteredReminders.map((rem) => {
                    const isTaken = rem.status === 'taken';
                    const isSnoozed = rem.status === 'snoozed';
                    const isSkipped = rem.status === 'skipped';

                    return (
                      <div
                        key={rem.id}
                        className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                          isTaken
                            ? 'bg-green-50/20'
                            : isSkipped
                            ? 'bg-slate-50/50 opacity-75'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`p-2.5 rounded-xl border mt-0.5 shrink-0 ${
                              isTaken
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : isSnoozed
                                ? 'bg-amber-100 text-amber-700 border-amber-200'
                                : isSkipped
                                ? 'bg-slate-100 text-slate-400 border-slate-200'
                                : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}
                          >
                            <Clock className="w-5 h-5" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{rem.medicineName}</h4>
                              <span className="text-xs font-semibold text-slate-400">
                                ({rem.strength})
                              </span>
                              <Badge
                                variant={
                                  isTaken
                                    ? 'success'
                                    : isSnoozed
                                    ? 'warning'
                                    : isSkipped
                                    ? 'neutral'
                                    : 'primary'
                                }
                                size="sm"
                              >
                                {isTaken
                                  ? `Taken (${rem.acknowledgedAt})`
                                  : isSnoozed
                                  ? `Snoozed (${rem.snoozedUntil})`
                                  : isSkipped
                                  ? `Skipped (${rem.skipReason})`
                                  : 'Pending'}
                              </Badge>
                            </div>

                            <p className="text-xs font-semibold text-slate-700 mt-0.5">
                              {rem.dosage} &bull; Scheduled for <strong>{rem.scheduledTime}</strong> ({rem.timeSlot})
                            </p>

                            <p className="text-xs text-slate-500 mt-1 italic flex items-center gap-1">
                              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              {rem.instructions}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {isTaken ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
                              <CheckCircle2 className="w-4 h-4 text-green-600" /> Dose Acknowledged
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleMarkTaken(rem.id, rem.medicineName)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-xs transition-all hover:scale-105"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Taken
                              </button>

                              <button
                                onClick={() => handleSnooze(rem.id, rem.medicineName)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Snooze
                              </button>

                              <button
                                onClick={() => {
                                  setSkipReminderId(rem.id);
                                }}
                                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                              >
                                Skip
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEDICINE VAULT */}
          {activeTab === 'vault' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Personal Medicine Vault</h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive formulary details, formulation, manufacturer, and days remaining.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-5">
                {MOCK_VAULT_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition ${
                      item.needsRefill
                        ? 'border-amber-200 bg-amber-50/20'
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{item.medicineName}</h4>
                        <p className="text-xs text-slate-500">
                          Brand: {item.brand} &bull; {item.form} ({item.strength})
                        </p>
                      </div>
                      {item.needsRefill ? (
                        <Badge variant="warning" size="sm">
                          Refill Needed ({item.daysRemaining}d left)
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          {item.daysRemaining} Days Supply
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-2">{item.notes}</p>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold">In Stock</span>
                        <span className="font-bold text-slate-800">{item.currentStock} units</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold">Daily Dose</span>
                        <span className="font-bold text-slate-800">{item.dailyDoses} / day</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold">Refill Alert</span>
                        <span className="font-bold text-slate-800">&le; {item.refillThreshold} days</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">
                        Known Side Effects to Monitor
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.sideEffectsPreview.map((effect, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200"
                          >
                            {effect}
                          </span>
                        ))}
                      </div>
                    </div>

                    {item.needsRefill && (
                      <div className="mt-4 pt-3 border-t border-amber-200/60 flex justify-end">
                        <button
                          onClick={() => setRefillModalItem(item)}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs transition"
                        >
                          Request Pharmacy Refill &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MY PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Received Digital Prescriptions</h3>
                <p className="text-xs text-slate-500">
                  Doctor-approved digital prescriptions containing validated schedules and refill tokens.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {MOCK_PRESCRIPTIONS.map((rx) => (
                  <div key={rx.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-700">
                            {rx.prescriptionNumber}
                          </span>
                          <Badge variant="success" size="sm">
                            {rx.status}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{rx.diagnosis}</h4>
                        <p className="text-xs text-slate-500">
                          Prescribed by <strong>{rx.doctorName}</strong> ({rx.doctorSpecialty}) on {rx.createdAt}
                        </p>
                      </div>

                      <button
                        onClick={() => setViewingRx(rx)}
                        className="self-start sm:self-center px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                      >
                        View Full Details
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {rx.items.map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                          <div className="font-bold text-slate-800">{item.medicineName} ({item.strength})</div>
                          <div className="text-[11px] text-slate-500">{item.dosage} &bull; {item.frequency}</div>
                          {item.instructions && (
                            <p className="text-[10px] text-blue-800 italic mt-1">{item.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ADHERENCE HISTORY */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Self-Reported Adherence History</h3>
                  <p className="text-xs text-slate-500">
                    A permanent audit log of medication acknowledgements for review with your healthcare provider.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                      <th className="py-3 px-4">Medication</th>
                      <th className="py-3 px-4">Dosage</th>
                      <th className="py-3 px-4">Scheduled Time</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Logged Timestamp</th>
                      <th className="py-3 px-4">Reporting Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_HISTORY_LOGS.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-slate-800">{log.medicineName}</td>
                        <td className="py-3 px-4 text-slate-600">{log.dosage}</td>
                        <td className="py-3 px-4 text-slate-500">{log.scheduledTime}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              log.action === 'taken'
                                ? 'success'
                                : log.action === 'snoozed'
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {log.action.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-semibold">{log.actionTimestamp}</td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          Self-Reported Patient Confirmation
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: REFILL RADAR */}
          {activeTab === 'refill' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Refill Radar</h3>
                  <p className="text-xs text-slate-500">
                    Predictive inventory calculation warning you before medication supplies run dry.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {MOCK_VAULT_ITEMS.filter((v) => v.needsRefill).map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{item.medicineName}</h4>
                        <span className="text-xs text-amber-800 font-bold">Only {item.daysRemaining} days left!</span>
                      </div>
                      <Badge variant="warning" size="sm">
                        Stock: {item.currentStock}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{item.notes}</p>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setRefillModalItem(item)}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs shadow-xs"
                      >
                        Order Refill Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PHARMACY DISCOVERY */}
          {activeTab === 'pharmacy' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Participating Pharmacy Network</h3>
                  <p className="text-xs text-slate-500">
                    Locate nearby authorized pharmacies with real-time stock verification.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 sm:p-5">
                {MOCK_PHARMACIES.map((pharm) => (
                  <div key={pharm.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 flex flex-col justify-between hover:border-blue-300 transition">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-bold text-slate-900">{pharm.name}</h4>
                        <span className="text-xs font-bold text-amber-600">&starf; {pharm.rating}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{pharm.address}</p>
                      <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                        <div>Distance: <strong>{pharm.distanceKm} km away</strong></div>
                        <div>Hours: {pharm.operatingHours}</div>
                        <div>Stock verified: <span className="text-green-700 font-semibold">{pharm.inventoryVerifiedDate}</span></div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700">
                        {pharm.supportsDelivery ? 'Delivery Available' : 'Store Pickup Only'}
                      </span>
                      <a
                        href={`tel:${pharm.phone}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        Call Pharmacy &rarr;
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: SKIP REASON PROMPT */}
      {skipReminderId && (
        <Modal
          isOpen={!!skipReminderId}
          onClose={() => setSkipReminderId(null)}
          title="Skip Medication Dose"
          description="Logging a reason helps your doctor evaluate and adjust your treatment regimen."
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Skipping:
              </label>
              <select
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="Away from home without medication">Away from home without medication</option>
                <option value="Experiencing nausea / adverse effect">Experiencing nausea / adverse effect</option>
                <option value="Fasting / medical procedure scheduled">Fasting / medical procedure scheduled</option>
                <option value="Supply temporarily unavailable">Supply temporarily unavailable</option>
                <option value="Other reason">Other personal reason</option>
              </select>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Skipping doses repeatedly may affect treatment efficacy. Consult your doctor if side effects persist.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSkipReminderId(null)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSkip}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs"
              >
                Confirm Skip
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: VIEW RX DETAILS */}
      {viewingRx && (
        <Modal
          isOpen={!!viewingRx}
          onClose={() => setViewingRx(null)}
          title={`Digital Prescription: ${viewingRx.prescriptionNumber}`}
          description={`Prescribed by ${viewingRx.doctorName}`}
          maxWidth="md"
        >
          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900">{viewingRx.diagnosis}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Clinic: {viewingRx.clinicOrHospital}</div>
              <div className="text-[11px] text-slate-500">Date: {viewingRx.createdAt}</div>
            </div>

            <div className="space-y-2">
              {viewingRx.items.map((item, i) => (
                <div key={i} className="p-3 border border-slate-200 rounded-xl bg-white">
                  <div className="font-bold text-slate-900">{item.medicineName} ({item.strength})</div>
                  <div className="text-slate-600 text-[11px]">{item.dosage} &bull; {item.frequency}</div>
                  <div className="text-blue-800 italic text-[11px] mt-1">{item.instructions}</div>
                </div>
              ))}
            </div>

            {viewingRx.doctorNotes && (
              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100 text-[11px] text-blue-900">
                <strong>Doctor Notes:</strong> {viewingRx.doctorNotes}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL: REFILL REQUEST */}
      {refillModalItem && (
        <Modal
          isOpen={!!refillModalItem}
          onClose={() => setRefillModalItem(null)}
          title={`Refill Request: ${refillModalItem.medicineName}`}
          description="Send refill request to participating dispensary."
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
              Current stock: <strong>{refillModalItem.currentStock} units</strong> ({refillModalItem.daysRemaining} days remaining).
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Preferred Pharmacy:
              </label>
              <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
                {MOCK_PHARMACIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.distanceKm} km away)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRefillModalItem(null)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast({
                    type: 'success',
                    title: 'Refill Request Dispatched',
                    message: `Refill for ${refillModalItem.medicineName} sent to CarePoint Pharmacy for review.`,
                  });
                  setRefillModalItem(null);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
              >
                Send Refill Request
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
