'use client';

import React, { useState } from 'react';
import {
  Users,
  Bell,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Send,
  Lock,
} from 'lucide-react';
import { PortalSidebar, NavItem } from '@/components/layout/PortalSidebar';
import { PortalHeader } from '@/components/layout/PortalHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  MOCK_LINKED_MEMBERS,
  MOCK_GUARDIAN_ACTIVITIES,
  MOCK_GUARDIAN_NOTIFICATIONS,
} from '@/lib/mock-data';
import { LinkedFamilyMember, GuardianActivityItem, GuardianNotification } from '@/types/guardian';

export default function GuardianPortalPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('members');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Guardian state
  const [members] = useState<LinkedFamilyMember[]>(MOCK_LINKED_MEMBERS);
  const [activities] = useState<GuardianActivityItem[]>(MOCK_GUARDIAN_ACTIVITIES);
  const [notifications, setNotifications] = useState<GuardianNotification[]>(MOCK_GUARDIAN_NOTIFICATIONS);

  // Modals state
  const [selectedMember, setSelectedMember] = useState<LinkedFamilyMember | null>(null);
  const [reminderModalMember, setReminderModalMember] = useState<LinkedFamilyMember | null>(null);
  const [reminderNote, setReminderNote] = useState('Hi Mom, gently checking in to make sure you had lunch and took your medication!');

  const navItems: NavItem[] = [
    { id: 'members', label: 'Linked Members', icon: Users, badge: members.length },
    { id: 'activity', label: 'Medication Activity', icon: Clock },
    { id: 'alerts', label: 'Caregiver Alerts', icon: Bell, badge: notifications.filter((n) => !n.isRead).length },
    { id: 'consent', label: 'Consent Governance', icon: ShieldCheck },
  ];

  // ACTION: Send gentle reminder nudge
  const handleSendReminderNudge = () => {
    if (!reminderModalMember) return;
    toast({
      type: 'success',
      title: 'Supportive Nudge Sent',
      message: `Friendly check-in notification delivered to ${reminderModalMember.fullName}'s device.`,
    });
    setReminderModalMember(null);
  };

  // ACTION: Mark alert as read
  const handleDismissAlert = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const pendingDosesAcrossMembers = members.reduce((sum, m) => sum + m.todayPendingDoses, 0);
  const refillAlertsAcrossMembers = members.reduce((sum, m) => sum + m.refillAlertsCount, 0);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <PortalSidebar
        portalId="guardian"
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <PortalHeader
          portalName="Family Guardian Portal"
          userName="Michael Taylor"
          userRole="Caregiver &bull; 2 Linked Family Members"
          userAvatarLetter="MT"
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          searchPlaceholder="Search family members, activities..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Family Caregiver Guardian
                </h1>
                <Badge variant="blue" size="sm">
                  Consent-Protected
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Oversee loved ones&rsquo; medication adherence, track refill urgency, and receive timely alerts with full patient authorization.
              </p>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px]">
              <Lock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Only authorized medication parameters are accessible per patient consent.</span>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Linked Members"
              value={members.length}
              subtitle="Authorized by patient consent"
              icon={Users}
              colorScheme="blue"
            />
            <MetricCard
              title="Pending Doses"
              value={pendingDosesAcrossMembers}
              subtitle="Awaiting today's confirmation"
              icon={Clock}
              colorScheme="secondary"
            />
            <MetricCard
              title="Refill Alerts"
              value={refillAlertsAcrossMembers}
              subtitle="Medicines needing pickup"
              icon={AlertTriangle}
              colorScheme="amber"
            />
            <MetricCard
              title="Average Adherence"
              value="91%"
              subtitle="Across linked members"
              icon={CheckCircle2}
              colorScheme="green"
            />
          </div>

          {/* TAB 1: LINKED MEMBERS */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      {/* Top Row: Avatar & Consent */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-base shadow-xs">
                            {member.fullName.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-900">{member.fullName}</h3>
                            <p className="text-xs text-slate-500">
                              {member.relationship} &bull; {member.age} years old
                            </p>
                          </div>
                        </div>

                        <Badge variant="success" size="sm">
                          {member.adherenceRate}% Adherence
                        </Badge>
                      </div>

                      {/* Consent Scope */}
                      <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-400 uppercase font-bold text-[10px]">Authorized Scope</span>
                          <span className="text-blue-700 font-semibold">{member.consentLevel}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Consent confirmed on {member.consentGrantedDate}
                        </span>
                      </div>

                      {/* Today's Status Summary */}
                      <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-green-50/80 rounded-xl border border-green-200 text-green-900">
                          <span className="text-green-800 font-bold block text-sm">
                            {member.todayTakenDoses} Doses Taken
                          </span>
                          <span className="text-[10px] text-green-700">Self-reported today</span>
                        </div>
                        <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-900">
                          <span className="text-amber-800 font-bold block text-sm">
                            {member.todayPendingDoses} Doses Pending
                          </span>
                          <span className="text-[10px] text-amber-700">Scheduled for later</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Active {member.lastActiveTime}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setReminderModalMember(member)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" /> Send Nudge
                        </button>
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MEDICATION ACTIVITY FEED */}
          {activeTab === 'activity' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Real-Time Medication Feed</h3>
                <p className="text-xs text-slate-500">
                  Self-reported events and system refill alerts from authorized family members.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {activities.map((act) => (
                  <div key={act.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/60">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                          act.action === 'taken'
                            ? 'bg-emerald-100 text-emerald-700'
                            : act.action === 'refill_needed'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {act.action === 'taken' && <CheckCircle2 className="w-4 h-4" />}
                        {act.action === 'refill_needed' && <AlertTriangle className="w-4 h-4" />}
                        {act.action === 'missed' && <Clock className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{act.memberName}</span>
                          <span className="text-slate-400 text-xs">&bull;</span>
                          <span className="text-slate-700 font-semibold text-xs">{act.medicineName}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{act.dosage}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {act.timestamp} &bull; {act.selfReported ? 'Self-Reported by Patient' : 'Automated System Alert'}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={
                        act.action === 'taken'
                          ? 'success'
                          : act.action === 'refill_needed'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {act.action === 'taken' ? 'Dose Taken' : act.action === 'refill_needed' ? 'Refill Warning' : 'Missed'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CAREGIVER ALERTS */}
          {activeTab === 'alerts' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Caregiver Action Notifications</h3>
                  <p className="text-xs text-slate-500">
                    High priority notices requiring caregiver attention or pharmacy assistance.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition ${
                      notif.isRead ? 'bg-white opacity-80' : 'bg-amber-50/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs">{notif.title}</h4>
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-semibold">
                            {notif.memberName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 max-w-xl">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{notif.createdAt}</span>
                      </div>
                    </div>

                    {!notif.isRead && (
                      <button
                        onClick={() => handleDismissAlert(notif.id)}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CONSENT GOVERNANCE EXPLAINER */}
          {activeTab === 'consent' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Patient Consent &amp; Privacy Architecture
                  </h3>
                  <p className="text-xs text-slate-500">
                    How PillReminder strictly balances caregiver oversight with patient autonomy.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="font-bold text-xs text-slate-900 mb-1">1. Patient-Initiated Invites</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Patients must explicitly grant caregiver access via their own account with two-factor approval.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="font-bold text-xs text-slate-900 mb-1">2. Granular Tiered Scope</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Patients can choose between Adherence-Only or Full Medication Overviews.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="font-bold text-xs text-slate-900 mb-1">3. Instant Revocation</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    The patient can pause or revoke caregiver access at any moment with immediate effect.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: SEND NUDGE */}
      {reminderModalMember && (
        <Modal
          isOpen={!!reminderModalMember}
          onClose={() => setReminderModalMember(null)}
          title={`Send Supportive Check-in to ${reminderModalMember.fullName}`}
          description="Send a friendly notification to help keep medication on track."
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message:</label>
              <textarea
                rows={3}
                value={reminderNote}
                onChange={(e) => setReminderNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setReminderModalMember(null)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReminderNudge}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Send Reminder
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: MEMBER PROFILE */}
      {selectedMember && (
        <Modal
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          title={`Care Profile: ${selectedMember.fullName}`}
          description={`Relationship: ${selectedMember.relationship} (${selectedMember.age}y)`}
          maxWidth="sm"
        >
          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div>Phone: <strong>{selectedMember.phone}</strong></div>
              <div>Consent Level: <strong>{selectedMember.consentLevel}</strong></div>
              <div>Authorized On: <strong>{selectedMember.consentGrantedDate}</strong></div>
              <div>Weekly Adherence: <strong className="text-emerald-600">{selectedMember.adherenceRate}%</strong></div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
