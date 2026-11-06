import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AiToolsService, ToolExecutionContext } from './ai-tools.service.js';

describe('AiToolsService', () => {
  let service: AiToolsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      patientProfile: {
        findUnique: vi.fn(),
      },
      medicationReminder: {
        findMany: vi.fn(),
      },
      medicationHistory: {
        findMany: vi.fn(),
      },
      prescription: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      pharmacyInventory: {
        findMany: vi.fn(),
      },
      pharmacyOrder: {
        findMany: vi.fn(),
      },
      guardianLink: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    };

    service = new AiToolsService(mockPrisma);
  });

  it('should return profile for authenticated patient', async () => {
    const context: ToolExecutionContext = { userId: 'pat-101', userRole: 'patient' };
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'pat-101',
      fullName: 'Robert Taylor',
      email: 'robert.taylor@example.com',
      role: 'patient',
      phone: '+1 555-234-5678',
      patientProfile: {
        age: 64,
        gender: 'Male',
        bloodGroup: 'O+',
        allergies: ['Penicillin'],
        chronicConditions: ['Hypertension'],
        adherenceRate: 94.0,
      },
    });

    const res = await service.getMyProfile(context);
    expect(res.status).toBe('success');
    expect(res.profile.fullName).toBe('Robert Taylor');
    expect(res.profile.clinicalDetails.allergies).toContain('Penicillin');
  });

  it('should enforce patient self-ownership for reminders', async () => {
    const context: ToolExecutionContext = { userId: 'pat-101', userRole: 'patient' };
    // Patient attempts to request reminders for someone else
    mockPrisma.medicationReminder.findMany.mockResolvedValue([
      {
        id: 'rem-1',
        patientId: 'pat-101',
        medicineName: 'Amlodipine Besylate',
        strength: '5 mg',
        dosage: '1 tablet',
        scheduledTime: '08:00 AM',
        timeSlot: 'Morning',
        instructions: 'After breakfast',
        status: 'taken',
        prescribingDoctor: 'Dr. Sarah Jenkins',
        remainingDays: 24,
      },
    ]);

    const res = await service.getTodayReminders({ patientId: 'pat-999' }, context);
    // Should resolve strictly to authenticated patient pat-101
    expect(res.status).toBe('success');
    expect(res.patientId).toBe('pat-101');
    expect(res.reminders[0].medicineName).toBe('Amlodipine Besylate');
  });

  it('should return active prescriptions with items', async () => {
    const context: ToolExecutionContext = { userId: 'pat-101', userRole: 'patient' };
    mockPrisma.prescription.findMany.mockResolvedValue([
      {
        id: 'rx-2026-001',
        prescriptionNumber: 'PR-89410-26',
        patientName: 'Robert Taylor',
        doctorName: 'Dr. Sarah Jenkins, MD',
        doctorSpecialty: 'Cardiology',
        clinicOrHospital: 'St. Jude Health Pavilion',
        diagnosis: 'Hypertension',
        status: 'Active',
        createdAt: new Date('2026-10-28'),
        items: [
          {
            medicineName: 'Amlodipine Besylate',
            strength: '5 mg',
            dosage: '1 tablet',
            frequency: 'Once daily',
            durationDays: 30,
            startDate: '2026-10-29',
            instructions: 'With water',
            reminderTimes: ['08:00 AM'],
          },
        ],
      },
    ]);

    const res = await service.getActivePrescriptions({}, context);
    expect(res.status).toBe('success');
    expect(res.count).toBe(1);
    expect(res.prescriptions[0].prescriptionNumber).toBe('PR-89410-26');
    expect(res.prescriptions[0].medicines[0].name).toBe('Amlodipine Besylate');
  });

  it('should return pharmacy inventory and filter low stock', async () => {
    const context: ToolExecutionContext = { userId: 'pharma-001', userRole: 'pharmacy' };
    mockPrisma.pharmacyInventory.findMany.mockResolvedValue([
      {
        id: 'inv-4',
        pharmacyId: 'pharma-001',
        medicineName: 'Lisinopril',
        brand: 'Zestril',
        strength: '10 mg',
        form: 'Tablet',
        quantity: 6,
        price: 11.25,
        isAvailable: true,
        expiryDate: '2027-08-30',
        requiresPrescription: true,
      },
    ]);

    const res = await service.getPharmacyInventory({ lowStockOnly: true }, context);
    expect(res.status).toBe('success');
    expect(res.items[0].isLowStock).toBe(true);
    expect(res.items[0].quantityInStock).toBe(6);
  });

  it('should enforce guardian consent check', async () => {
    const context: ToolExecutionContext = { userId: 'guard-001', userRole: 'guardian' };
    // No consent granted for pat-999
    mockPrisma.guardianLink.findMany.mockResolvedValue([]);

    const res = await service.getGuardianActivity({ memberId: 'pat-999' }, context);
    expect(res.status).toBe('warning');
    expect(res.message).toContain('No active patient consent authorizations');
  });
});
