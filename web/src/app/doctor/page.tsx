'use client';

import React, { useState } from 'react';
import {
  Users,
  FilePlus,
  FileCheck,
  Calendar,
  Plus,
  Trash2,
  Eye,
  QrCode,
  AlertCircle,
  Clock,
  Printer,
  Info,
} from 'lucide-react';
import { PortalSidebar, NavItem } from '@/components/layout/PortalSidebar';
import { PortalHeader } from '@/components/layout/PortalHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { MOCK_PATIENTS, MOCK_PRESCRIPTIONS } from '@/lib/mock-data';
import { Prescription, PrescriptionItem } from '@/types/prescription';
import { PatientSummary } from '@/types/patient';

export default function DoctorPortalPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Prescription list state
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(MOCK_PRESCRIPTIONS);

  // Modals state
  const [isNewRxModalOpen, setIsNewRxModalOpen] = useState(false);
  const [previewRx, setPreviewRx] = useState<Prescription | null>(null);
  const [qrRx, setQrRx] = useState<Prescription | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null);

  // New Prescription Form state
  const [newRxPatientId, setNewRxPatientId] = useState(MOCK_PATIENTS[0].id);
  const [newRxDiagnosis, setNewRxDiagnosis] = useState('');
  const [newRxNotes, setNewRxNotes] = useState('');
  const [newRxItems, setNewRxItems] = useState<PrescriptionItem[]>([
    {
      id: 'item-1',
      medicineName: '',
      strength: '',
      dosage: '1 tablet',
      frequency: 'Once daily (morning)',
      durationDays: 30,
      startDate: new Date().toISOString().split('T')[0],
      instructions: 'Take with a glass of water after meals.',
      reminderTimes: ['08:00 AM'],
      notes: '',
    },
  ]);

  const navItems: NavItem[] = [
    { id: 'prescriptions', label: 'Prescriptions', icon: FileCheck, badge: prescriptions.length },
    { id: 'patients', label: 'Patient Directory', icon: Users, badge: MOCK_PATIENTS.length },
    { id: 'new_rx', label: 'Create Digital Rx', icon: FilePlus },
    { id: 'schedules', label: 'Reminder Automation', icon: Clock },
  ];

  const addMedicineRow = () => {
    setNewRxItems((prev) => [
      ...prev,
      {
        id: 'item-' + (prev.length + 1),
        medicineName: '',
        strength: '',
        dosage: '1 tablet',
        frequency: 'Once daily',
        durationDays: 30,
        startDate: new Date().toISOString().split('T')[0],
        instructions: 'Take after meals.',
        reminderTimes: ['08:00 AM'],
      },
    ]);
  };

  const removeMedicineRow = (index: number) => {
    if (newRxItems.length === 1) {
      toast({
        type: 'warning',
        title: 'At least one medicine is required',
        message: 'A prescription must contain at least one prescribed drug.',
      });
      return;
    }
    setNewRxItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMedicineRow = (index: number, field: keyof PrescriptionItem, value: unknown) => {
    setNewRxItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();

    const patient = MOCK_PATIENTS.find((p) => p.id === newRxPatientId) || MOCK_PATIENTS[0];

    const hasEmptyName = newRxItems.some((item) => !item.medicineName.trim());
    if (hasEmptyName) {
      toast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide medicine names for all items in the prescription.',
      });
      return;
    }

    const newPrescription: Prescription = {
      id: 'rx-' + Date.now(),
      prescriptionNumber: `PR-${Math.floor(10000 + Math.random() * 90000)}-26`,
      patientId: patient.id,
      patientName: patient.fullName,
      patientAge: patient.age,
      patientGender: patient.gender,
      doctorId: 'doc-001',
      doctorName: 'Dr. Sarah Jenkins, MD',
      doctorSpecialty: 'Internal Medicine & Cardiology',
      clinicOrHospital: 'St. Jude Health Pavilion, Suite 402',
      diagnosis: newRxDiagnosis || 'Clinical Consultation',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Approved',
      qrReferenceCode: `PR-SECURE-TOKEN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      doctorNotes: newRxNotes,
      items: newRxItems,
    };

    setPrescriptions((prev) => [newPrescription, ...prev]);
    setIsNewRxModalOpen(false);
    setActiveTab('prescriptions');

    toast({
      type: 'success',
      title: 'Digital Prescription Approved',
      message: `${newPrescription.prescriptionNumber} created. Patient reminder schedule generated automatically!`,
    });

    setNewRxDiagnosis('');
    setNewRxNotes('');
    setNewRxItems([
      {
        id: 'item-1',
        medicineName: '',
        strength: '',
        dosage: '1 tablet',
        frequency: 'Once daily (morning)',
        durationDays: 30,
        startDate: new Date().toISOString().split('T')[0],
        instructions: 'Take after breakfast.',
        reminderTimes: ['08:00 AM'],
      },
    ]);
  };

  const filteredPrescriptions = prescriptions.filter(
    (rx) =>
      rx.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.prescriptionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPatients = MOCK_PATIENTS.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery)
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      <PortalSidebar
        portalId="doctor"
        navItems={navItems}
        activeTab={activeTab === 'new_rx' ? 'prescriptions' : activeTab}
        onTabChange={(tab) => {
          if (tab === 'new_rx') {
            setIsNewRxModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <PortalHeader
          portalName="Doctor Clinical Portal"
          userName="Dr. Sarah Jenkins, MD"
          userRole="Cardiology & Internal Medicine"
          userAvatarLetter="SJ"
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          searchPlaceholder="Search patients, prescriptions, or drugs..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Doctor Clinical Workspace
                </h1>
                <Badge variant="primary" size="sm">
                  St. Jude Health
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Generate tamper-evident digital prescriptions, review patient adherence rates, and oversee medication schedules.
              </p>
            </div>

            <button
              onClick={() => setIsNewRxModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Prescription
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Patients"
              value={MOCK_PATIENTS.length}
              subtitle="Registered under care"
              icon={Users}
              colorScheme="blue"
            />
            <MetricCard
              title="Active Prescriptions"
              value={prescriptions.filter((p) => p.status === 'Active' || p.status === 'Approved').length}
              subtitle="Automated in schedule"
              icon={FileCheck}
              colorScheme="blue"
            />
            <MetricCard
              title="Total Prescribed"
              value={prescriptions.length + 18}
              subtitle="Since quarter start"
              icon={FilePlus}
              colorScheme="secondary"
            />
            <MetricCard
              title="Pending Follow-ups"
              value={2}
              subtitle="Next 7 days"
              icon={Calendar}
              colorScheme="amber"
            />
          </div>

          {/* TAB 1: PRESCRIPTIONS LIST */}
          {activeTab === 'prescriptions' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Digital Prescriptions Directory</h3>
                  <p className="text-xs text-slate-500">
                    All digital prescriptions generated with automated reminder parameters.
                  </p>
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  Showing {filteredPrescriptions.length} prescriptions
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                      <th className="py-3 px-4">Rx Number</th>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Diagnosis</th>
                      <th className="py-3 px-4">Medicines Prescribed</th>
                      <th className="py-3 px-4">Issued Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPrescriptions.map((rx) => (
                      <tr key={rx.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                          {rx.prescriptionNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{rx.patientName}</div>
                          <div className="text-[10px] text-slate-500">
                            {rx.patientAge}y &bull; {rx.patientGender}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {rx.diagnosis}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            {rx.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                                <span className="font-semibold">{item.medicineName}</span>
                                <span className="text-slate-500">({item.strength})</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{rx.createdAt}</td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              rx.status === 'Approved'
                                ? 'success'
                                : rx.status === 'Active'
                                ? 'primary'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {rx.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPreviewRx(rx)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Preview Full Prescription"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setQrRx(rx)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View Secure QR Reference"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: PATIENTS LIST */}
          {activeTab === 'patients' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Assigned Patients Directory</h3>
                  <p className="text-xs text-slate-500">
                    Patient clinical profiles, adherence history, and active medication regimens.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-5">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition bg-white flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{patient.fullName}</h4>
                          <p className="text-xs text-slate-500">
                            {patient.age} years old &bull; {patient.gender} &bull; Blood: {patient.bloodGroup}
                          </p>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                          {patient.adherenceRate}% Adherence
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone</span>
                          {patient.phone}
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                          {patient.email}
                        </div>
                      </div>

                      <div className="mt-3">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                          Chronic Conditions
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {patient.chronicConditions.map((c, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      {patient.allergies.length > 0 && (
                        <div className="mt-2.5">
                          <span className="text-red-500 text-[10px] uppercase font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Allergy Warning
                          </span>
                          <span className="text-xs text-red-700 font-semibold">
                            {patient.allergies.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Last seen: {patient.lastConsultation}
                      </span>
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                      >
                        View Full Chart &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REMINDER AUTOMATION EXPLAINER */}
          {activeTab === 'schedules' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Prescription-to-Reminder Automation Engine
                  </h3>
                  <p className="text-xs text-slate-500">
                    Eliminating manual schedule entry errors by deriving patient alarms directly from clinical orders.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="font-bold text-xs text-slate-900 mb-1">1. Parameter Parsing</div>
                  <p className="text-xs text-slate-500">
                    Dosage frequency (e.g. &ldquo;Twice daily&rdquo;) automatically maps to standard patient slots (08:30 AM &amp; 07:30 PM).
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="font-bold text-xs text-slate-900 mb-1">2. Food &amp; Water Instructions</div>
                  <p className="text-xs text-slate-500">
                    Physician instructions (&ldquo;take after food&rdquo;) appear on the patient notification screen.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="font-bold text-xs text-slate-900 mb-1">3. Self-Reported Feedback Loop</div>
                  <p className="text-xs text-slate-500">
                    Patient self-reports doses as Taken, Snoozed, or Skipped with logged timestamps for your review.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: CREATE DIGITAL PRESCRIPTION */}
      <Modal
        isOpen={isNewRxModalOpen}
        onClose={() => setIsNewRxModalOpen(false)}
        title="Create Digital Prescription"
        description="Configure medications, dosages, and automated reminder schedules for the patient."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreatePrescription} className="space-y-5 text-xs text-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Patient *
            </label>
            <select
              value={newRxPatientId}
              onChange={(e) => setNewRxPatientId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
            >
              {MOCK_PATIENTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.age}y, {p.gender}) &bull; Blood: {p.bloodGroup}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Diagnosis / Clinical Indication *
            </label>
            <input
              type="text"
              placeholder="e.g. Hypertension Stage 1, Type 2 Diabetes Management"
              value={newRxDiagnosis}
              onChange={(e) => setNewRxDiagnosis(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Medicine Rows */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Prescribed Medications
              </span>
              <button
                type="button"
                onClick={addMedicineRow}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Medicine
              </button>
            </div>

            {newRxItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-800">
                    Medicine #{idx + 1}
                  </span>
                  {newRxItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicineRow(idx)}
                      className="text-slate-400 hover:text-red-600 transition"
                      title="Remove Row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Medicine Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Amlodipine Besylate"
                      value={item.medicineName}
                      onChange={(e) => updateMedicineRow(idx, 'medicineName', e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Strength *</label>
                    <input
                      type="text"
                      placeholder="e.g. 5 mg, 500 mg"
                      value={item.strength}
                      onChange={(e) => updateMedicineRow(idx, 'strength', e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Dosage</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 tablet"
                      value={item.dosage}
                      onChange={(e) => updateMedicineRow(idx, 'dosage', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Frequency</label>
                    <select
                      value={item.frequency}
                      onChange={(e) => updateMedicineRow(idx, 'frequency', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="Once daily (morning)">Once daily (morning)</option>
                      <option value="Once daily (night)">Once daily (night)</option>
                      <option value="Twice daily (morning and evening)">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Duration (Days)</label>
                    <input
                      type="number"
                      min={1}
                      value={item.durationDays}
                      onChange={(e) => updateMedicineRow(idx, 'durationDays', parseInt(e.target.value) || 30)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Start Date</label>
                    <input
                      type="date"
                      value={item.startDate}
                      onChange={(e) => updateMedicineRow(idx, 'startDate', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                    Patient Instructions / Food Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Take with water after breakfast. Avoid grapefruit juice."
                    value={item.instructions}
                    onChange={(e) => updateMedicineRow(idx, 'instructions', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Physician Notes &amp; Follow-up Advice
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Monitor blood pressure weekly. Return in 30 days for follow-up review."
              value={newRxNotes}
              onChange={(e) => setNewRxNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewRxModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition"
            >
              Approve &amp; Generate Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: PREVIEW PRESCRIPTION */}
      {previewRx && (
        <Modal
          isOpen={!!previewRx}
          onClose={() => setPreviewRx(null)}
          title={`Prescription ${previewRx.prescriptionNumber}`}
          description="Official Clinical Electronic Prescription Document"
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{previewRx.doctorName}</h4>
                <p className="text-blue-700 text-[11px]">{previewRx.doctorSpecialty}</p>
                <p className="text-slate-500 text-[10px] mt-0.5">{previewRx.clinicOrHospital}</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-blue-700">{previewRx.prescriptionNumber}</span>
                <p className="text-slate-500 text-[10px]">Date: {previewRx.createdAt}</p>
                <Badge variant="success" size="sm" className="mt-1">
                  {previewRx.status}
                </Badge>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Patient Details</span>
              <div className="flex items-center justify-between text-slate-800 font-semibold">
                <span>{previewRx.patientName}</span>
                <span className="text-slate-500 font-normal">
                  Age: {previewRx.patientAge} &bull; Gender: {previewRx.patientGender}
                </span>
              </div>
              <div className="mt-1 text-slate-600 text-[11px]">
                <strong className="text-slate-700">Diagnosis:</strong> {previewRx.diagnosis}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-2">Prescribed Items</span>
              <div className="space-y-2">
                {previewRx.items.map((item, idx) => (
                  <div key={idx} className="p-3 border border-slate-200 rounded-xl bg-white space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{item.medicineName} ({item.strength})</span>
                      <span className="text-slate-500 text-[11px] font-normal">{item.dosage}</span>
                    </div>
                    <div className="text-slate-600 text-[11px] flex items-center justify-between">
                      <span>Frequency: {item.frequency}</span>
                      <span>Duration: {item.durationDays} days</span>
                    </div>
                    {item.instructions && (
                      <p className="text-[11px] text-blue-800 italic bg-blue-50/60 p-1.5 rounded-md mt-1">
                        Instructions: {item.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {previewRx.doctorNotes && (
              <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 text-[11px] text-slate-600">
                <strong className="text-slate-800 block mb-0.5">Physician Instructions:</strong>
                {previewRx.doctorNotes}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => setQrRx(previewRx)}
                className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:text-blue-700"
              >
                <QrCode className="w-4 h-4" /> View QR Reference
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
              >
                <Printer className="w-3.5 h-3.5" /> Print Copy
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: QR PRESCRIPTION REFERENCE */}
      {qrRx && (
        <Modal
          isOpen={!!qrRx}
          onClose={() => setQrRx(null)}
          title="Secure QR Prescription Reference"
          description="Safe dispensary verification token without unencrypted patient medical data."
          maxWidth="sm"
        >
          <div className="flex flex-col items-center text-center space-y-4 text-xs">
            <div className="p-4 bg-white rounded-2xl border-2 border-slate-800 shadow-md flex flex-col items-center justify-center">
              <div className="w-44 h-44 bg-slate-900 rounded-xl p-3 flex flex-col items-center justify-center text-white relative">
                <svg className="w-full h-full text-white" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M10 10h30v30H10zm5 5v20h20V15zm45-5h30v30H60zm5 5v20h20V15zM10 60h30v30H10zm5 5v20h20V65zm45 0h10v10H60zm10 10h10v10H70zm10-10h10v10H80zm0 10h10v10H80zm-20 10h10v10H60z" />
                  <rect x="20" y="20" width="10" height="10" />
                  <rect x="70" y="20" width="10" height="10" />
                  <rect x="20" y="70" width="10" height="10" />
                  <rect x="45" y="45" width="10" height="10" />
                  <rect x="65" y="45" width="10" height="10" />
                  <rect x="45" y="65" width="10" height="10" />
                </svg>
              </div>
              <p className="font-mono text-[11px] font-bold text-slate-800 mt-2">
                {qrRx.qrReferenceCode}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1 font-bold text-slate-900">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                Privacy Safeguard Notice
              </div>
              <p>
                In compliance with healthcare data regulations, this QR token contains only an encrypted
                reference identifier. Participating pharmacies resolve this token securely via the verified
                dispensary network.
              </p>
            </div>

            <div className="w-full text-slate-500 text-[11px] flex justify-between border-t border-slate-100 pt-3">
              <span>Patient: <strong>{qrRx.patientName}</strong></span>
              <span>Rx: <strong>{qrRx.prescriptionNumber}</strong></span>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: PATIENT FULL CHART */}
      {selectedPatient && (
        <Modal
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          title={`Clinical Chart: ${selectedPatient.fullName}`}
          description={`Patient ID: ${selectedPatient.id}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Age / Gender</span>
                <span className="font-semibold">{selectedPatient.age}y &bull; {selectedPatient.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Blood Group</span>
                <span className="font-semibold">{selectedPatient.bloodGroup}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact</span>
                <span className="font-semibold">{selectedPatient.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Adherence Score</span>
                <span className="font-bold text-green-600">{selectedPatient.adherenceRate}% (Self-Reported)</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1.5">
                Active Regimens Under Care
              </span>
              <div className="space-y-1.5">
                {prescriptions
                  .filter((p) => p.patientId === selectedPatient.id)
                  .flatMap((p) => p.items)
                  .map((item, i) => (
                    <div key={i} className="p-2 border border-slate-200 rounded-lg flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{item.medicineName} ({item.strength})</span>
                      <span className="text-slate-500 text-[11px]">{item.frequency}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Close Chart
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
