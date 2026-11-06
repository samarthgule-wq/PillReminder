export interface PatientSummary {
  id: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  bloodGroup: string;
  activePrescriptionsCount: number;
  adherenceRate: number; // e.g. 92%
  lastConsultation: string;
  nextFollowUp?: string;
  allergies: string[];
  chronicConditions: string[];
}
