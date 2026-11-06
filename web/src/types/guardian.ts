export type ConsentLevel = 'Full Medication Overview' | 'Adherence & Alerts Only' | 'Emergency Notification Only';

export interface LinkedFamilyMember {
  id: string;
  fullName: string;
  relationship: 'Parent' | 'Spouse' | 'Child' | 'Grandparent' | 'Sibling' | 'Other';
  age: number;
  phone: string;
  avatarUrl?: string;
  consentGranted: boolean;
  consentLevel: ConsentLevel;
  consentGrantedDate: string;
  todayPendingDoses: number;
  todayTakenDoses: number;
  adherenceRate: number;
  refillAlertsCount: number;
  lastActiveTime: string;
}

export interface GuardianActivityItem {
  id: string;
  memberId: string;
  memberName: string;
  medicineName: string;
  dosage: string;
  action: 'taken' | 'snoozed' | 'missed' | 'refill_needed';
  timestamp: string;
  selfReported: boolean;
  authorizedView: boolean;
}

export interface GuardianNotification {
  id: string;
  memberId: string;
  memberName: string;
  type: 'missed_dose' | 'refill_urgency' | 'consent_update' | 'doctor_note';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}
