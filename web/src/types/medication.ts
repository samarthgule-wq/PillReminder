export type DoseStatus = 'pending' | 'taken' | 'snoozed' | 'skipped' | 'overdue';

export interface MedicationReminder {
  id: string;
  prescriptionId: string;
  medicineName: string;
  strength: string;
  dosage: string;
  scheduledTime: string;
  timeSlot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  instructions: string;
  status: DoseStatus;
  acknowledgedAt?: string;
  snoozedUntil?: string;
  skipReason?: string;
  prescribingDoctor: string;
  remainingDays: number;
}

export interface MedicationVaultItem {
  id: string;
  medicineName: string;
  genericName: string;
  brand: string;
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Inhaler' | 'Drops';
  strength: string;
  currentStock: number;
  totalPrescribed: number;
  refillThreshold: number;
  dailyDoses: number;
  daysRemaining: number;
  needsRefill: boolean;
  notes: string;
  sideEffectsPreview: string[];
}

export interface MedicationHistoryLog {
  id: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  action: 'taken' | 'snoozed' | 'skipped';
  actionTimestamp: string;
  selfReported: true; // Explicit declaration: acknowledgements are self-reported
  notes?: string;
}
