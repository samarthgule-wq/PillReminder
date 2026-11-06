export interface PrescriptionItem {
  id: string;
  medicineName: string;
  strength: string; // e.g. "500mg"
  dosage: string; // e.g. "1 tablet"
  frequency: string; // e.g. "Twice daily (after food)"
  durationDays: number;
  startDate: string;
  instructions: string;
  reminderTimes: string[]; // e.g. ["08:00 AM", "08:00 PM"]
  notes?: string;
}

export type PrescriptionStatus = 'Draft' | 'Approved' | 'Active' | 'Completed' | 'Cancelled';

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  clinicOrHospital: string;
  diagnosis: string;
  createdAt: string;
  status: PrescriptionStatus;
  items: PrescriptionItem[];
  qrReferenceCode: string; // Secure token/UUID reference for pharmacy scan (does NOT expose raw medical data)
  doctorNotes?: string;
}
