import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('Seeding PillReminder database...');

  // 1. Users
  const users = [
    {
      id: 'pat-101',
      email: 'robert.taylor@example.com',
      fullName: 'Robert Taylor',
      role: 'patient',
      phone: '+1 (555) 234-5678',
      avatarLetter: 'RT',
    },
    {
      id: 'pat-102',
      email: 'margaret.davis@example.com',
      fullName: 'Margaret Davis',
      role: 'patient',
      phone: '+1 (555) 876-5432',
      avatarLetter: 'MD',
    },
    {
      id: 'pat-103',
      email: 'j.wilson@example.com',
      fullName: 'James Wilson',
      role: 'patient',
      phone: '+1 (555) 345-6789',
      avatarLetter: 'JW',
    },
    {
      id: 'pat-104',
      email: 'clara.o@example.com',
      fullName: 'Clara Oswald',
      role: 'patient',
      phone: '+1 (555) 654-3210',
      avatarLetter: 'CO',
    },
    {
      id: 'doc-001',
      email: 'dr.jenkins@stjude.health',
      fullName: 'Dr. Sarah Jenkins, MD',
      role: 'doctor',
      phone: '+1 (555) 300-DOCS',
      avatarLetter: 'SJ',
    },
    {
      id: 'pharma-001',
      email: 'orders@carepoint.pharmacy',
      fullName: 'CarePoint Central Pharmacy',
      role: 'pharmacy',
      phone: '+1 (555) 424-CARE',
      avatarLetter: 'CP',
    },
    {
      id: 'guard-001',
      email: 'michael.guardian@family.care',
      fullName: 'Michael Taylor',
      role: 'guardian',
      phone: '+1 (555) 998-1122',
      avatarLetter: 'MT',
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: u,
      create: u,
    });
  }

  // 2. Patient Profiles
  const profiles = [
    {
      id: 'prof-101',
      userId: 'pat-101',
      age: 64,
      gender: 'Male',
      bloodGroup: 'O+',
      allergies: ['Penicillin', 'Sulfa drugs'],
      chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
      adherenceRate: 94.0,
      emergencyContact: '+1 (555) 998-1122 (Michael - Son)',
      lastConsultation: '2026-10-28',
      nextFollowUp: '2026-11-20',
    },
    {
      id: 'prof-102',
      userId: 'pat-102',
      age: 71,
      gender: 'Female',
      bloodGroup: 'A+',
      allergies: ['Codeine'],
      chronicConditions: ['Osteoarthritis', 'Hyperlipidemia'],
      adherenceRate: 88.0,
      emergencyContact: '+1 (555) 876-0000',
      lastConsultation: '2026-10-15',
      nextFollowUp: '2026-11-14',
    },
    {
      id: 'prof-103',
      userId: 'pat-103',
      age: 48,
      gender: 'Male',
      bloodGroup: 'B-',
      allergies: ['None known'],
      chronicConditions: ['Mild Asthma'],
      adherenceRate: 96.0,
      lastConsultation: '2026-11-01',
      nextFollowUp: '2026-12-01',
    },
    {
      id: 'prof-104',
      userId: 'pat-104',
      age: 39,
      gender: 'Female',
      bloodGroup: 'AB+',
      allergies: ['Aspirin'],
      chronicConditions: ['Migraine prophylaxis'],
      adherenceRate: 91.0,
      lastConsultation: '2026-10-30',
    },
  ];

  for (const p of profiles) {
    await prisma.patientProfile.upsert({
      where: { userId: p.userId },
      update: p,
      create: p,
    });
  }

  // 3. Prescriptions & Items
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();

  const rx1 = await prisma.prescription.create({
    data: {
      id: 'rx-2026-001',
      prescriptionNumber: 'PR-89410-26',
      patientId: 'pat-101',
      patientName: 'Robert Taylor',
      patientAge: 64,
      patientGender: 'Male',
      doctorId: 'doc-001',
      doctorName: 'Dr. Sarah Jenkins, MD',
      doctorSpecialty: 'Internal Medicine & Cardiology',
      clinicOrHospital: 'St. Jude Health Pavilion, Suite 402',
      diagnosis: 'Essential Hypertension, Stage 1 & Glycemic Control',
      status: 'Active',
      createdAt: new Date('2026-10-28'),
      doctorNotes: 'Maintain low-sodium diet and monitor morning resting heart rate.',
      items: {
        create: [
          {
            id: 'rx-item-1',
            medicineName: 'Amlodipine Besylate',
            strength: '5 mg',
            dosage: '1 tablet',
            frequency: 'Once daily (morning after breakfast)',
            durationDays: 30,
            startDate: '2026-10-29',
            instructions: 'Take with a full glass of water. Avoid grapefruit juice.',
            reminderTimes: ['08:00 AM'],
            notes: 'Target BP < 130/80 mmHg',
          },
          {
            id: 'rx-item-2',
            medicineName: 'Metformin HCl ER',
            strength: '500 mg',
            dosage: '1 tablet',
            frequency: 'Twice daily with meals',
            durationDays: 60,
            startDate: '2026-10-29',
            instructions: 'Take with morning and evening meals to minimize GI upset.',
            reminderTimes: ['08:30 AM', '07:30 PM'],
            notes: 'Extended release formulation - swallow whole, do not crush.',
          },
          {
            id: 'rx-item-3',
            medicineName: 'Atorvastatin Calcium',
            strength: '20 mg',
            dosage: '1 tablet',
            frequency: 'Once daily at bedtime',
            durationDays: 30,
            startDate: '2026-10-29',
            instructions: 'Take at night before sleep.',
            reminderTimes: ['09:30 PM'],
            notes: 'Routine lipid panel review scheduled next quarter.',
          },
        ],
      },
    },
  });

  const rx2 = await prisma.prescription.create({
    data: {
      id: 'rx-2026-002',
      prescriptionNumber: 'PR-89411-26',
      patientId: 'pat-102',
      patientName: 'Margaret Davis',
      patientAge: 71,
      patientGender: 'Female',
      doctorId: 'doc-001',
      doctorName: 'Dr. Sarah Jenkins, MD',
      doctorSpecialty: 'Internal Medicine & Cardiology',
      clinicOrHospital: 'St. Jude Health Pavilion, Suite 402',
      diagnosis: 'Moderate Osteoarthritis & Hypertension',
      status: 'Active',
      createdAt: new Date('2026-10-15'),
      doctorNotes: 'Physical therapy sessions twice weekly.',
      items: {
        create: [
          {
            id: 'rx-item-4',
            medicineName: 'Lisinopril',
            strength: '10 mg',
            dosage: '1 tablet',
            frequency: 'Once daily in the morning',
            durationDays: 90,
            startDate: '2026-10-16',
            instructions: 'Take consistently at the same time every morning.',
            reminderTimes: ['08:00 AM'],
          },
          {
            id: 'rx-item-5',
            medicineName: 'Glucosamine Sulfate',
            strength: '750 mg',
            dosage: '2 capsules',
            frequency: 'Once daily with food',
            durationDays: 90,
            startDate: '2026-10-16',
            instructions: 'Joint comfort supplement.',
            reminderTimes: ['12:30 PM'],
          },
        ],
      },
    },
  });

  // 4. Reminders
  await prisma.medicationReminder.deleteMany();
  const todayStr = new Date().toISOString().split('T')[0];

  const reminders = [
    {
      id: 'rem-1',
      patientId: 'pat-101',
      prescriptionId: 'rx-2026-001',
      medicineName: 'Amlodipine Besylate',
      strength: '5 mg',
      dosage: '1 tablet',
      scheduledTime: '08:00 AM',
      timeSlot: 'Morning',
      instructions: 'Take with full glass of water after breakfast',
      status: 'taken',
      acknowledgedAt: new Date(),
      prescribingDoctor: 'Dr. Sarah Jenkins',
      remainingDays: 24,
      scheduledDate: todayStr,
    },
    {
      id: 'rem-2',
      patientId: 'pat-101',
      prescriptionId: 'rx-2026-001',
      medicineName: 'Metformin HCl ER',
      strength: '500 mg',
      dosage: '1 tablet',
      scheduledTime: '08:30 AM',
      timeSlot: 'Morning',
      instructions: 'Take with morning meal. Do not crush tablet.',
      status: 'taken',
      acknowledgedAt: new Date(),
      prescribingDoctor: 'Dr. Sarah Jenkins',
      remainingDays: 54,
      scheduledDate: todayStr,
    },
    {
      id: 'rem-3',
      patientId: 'pat-101',
      prescriptionId: 'rx-2026-001',
      medicineName: 'Omega-3 Cardio Gold',
      strength: '1000 mg',
      dosage: '1 softgel',
      scheduledTime: '01:00 PM',
      timeSlot: 'Afternoon',
      instructions: 'Take with lunch',
      status: 'pending',
      prescribingDoctor: 'Dr. Sarah Jenkins',
      remainingDays: 12,
      scheduledDate: todayStr,
    },
    {
      id: 'rem-4',
      patientId: 'pat-101',
      prescriptionId: 'rx-2026-001',
      medicineName: 'Metformin HCl ER',
      strength: '500 mg',
      dosage: '1 tablet',
      scheduledTime: '07:30 PM',
      timeSlot: 'Evening',
      instructions: 'Take with dinner meal',
      status: 'pending',
      prescribingDoctor: 'Dr. Sarah Jenkins',
      remainingDays: 54,
      scheduledDate: todayStr,
    },
    {
      id: 'rem-5',
      patientId: 'pat-101',
      prescriptionId: 'rx-2026-001',
      medicineName: 'Atorvastatin Calcium',
      strength: '20 mg',
      dosage: '1 tablet',
      scheduledTime: '09:30 PM',
      timeSlot: 'Night',
      instructions: 'Take right before bedtime',
      status: 'pending',
      prescribingDoctor: 'Dr. Sarah Jenkins',
      remainingDays: 24,
      scheduledDate: todayStr,
    },
  ];

  for (const rem of reminders) {
    await prisma.medicationReminder.create({ data: rem });
  }

  // 5. Medication History
  await prisma.medicationHistory.deleteMany();
  const history = [
    {
      id: 'hist-1',
      patientId: 'pat-101',
      medicineName: 'Atorvastatin Calcium (20 mg)',
      dosage: '1 tablet',
      scheduledTime: 'Yesterday, 09:30 PM',
      action: 'taken',
      selfReported: true,
    },
    {
      id: 'hist-2',
      patientId: 'pat-101',
      medicineName: 'Metformin HCl ER (500 mg)',
      dosage: '1 tablet',
      scheduledTime: 'Yesterday, 07:30 PM',
      action: 'taken',
      selfReported: true,
    },
    {
      id: 'hist-3',
      patientId: 'pat-101',
      medicineName: 'Omega-3 Cardio Gold (1000 mg)',
      dosage: '1 softgel',
      scheduledTime: 'Yesterday, 01:00 PM',
      action: 'skipped',
      selfReported: true,
      notes: 'Patient noted: Away from home without medication container',
    },
    {
      id: 'hist-4',
      patientId: 'pat-101',
      medicineName: 'Metformin HCl ER (500 mg)',
      dosage: '1 tablet',
      scheduledTime: 'Yesterday, 08:30 AM',
      action: 'taken',
      selfReported: true,
    },
    {
      id: 'hist-5',
      patientId: 'pat-101',
      medicineName: 'Amlodipine Besylate (5 mg)',
      dosage: '1 tablet',
      scheduledTime: 'Yesterday, 08:00 AM',
      action: 'taken',
      selfReported: true,
    },
  ];

  for (const h of history) {
    await prisma.medicationHistory.create({ data: h });
  }

  // 6. Pharmacy Inventory
  await prisma.pharmacyInventory.deleteMany();
  const inventory = [
    {
      id: 'inv-1',
      pharmacyId: 'pharma-001',
      medicineName: 'Amlodipine Besylate',
      brand: 'Norvasc',
      strength: '5 mg',
      form: 'Tablet (Box of 30)',
      quantity: 140,
      price: 14.5,
      expiryDate: '2028-05-31',
      isAvailable: true,
      requiresPrescription: true,
      batchNumber: 'NOR-2026-90',
    },
    {
      id: 'inv-2',
      pharmacyId: 'pharma-001',
      medicineName: 'Metformin HCl ER',
      brand: 'Glucophage XR',
      strength: '500 mg',
      form: 'Tablet (Box of 60)',
      quantity: 85,
      price: 19.99,
      expiryDate: '2027-11-30',
      isAvailable: true,
      requiresPrescription: true,
      batchNumber: 'GLU-500-11',
    },
    {
      id: 'inv-3',
      pharmacyId: 'pharma-001',
      medicineName: 'Atorvastatin Calcium',
      brand: 'Lipitor',
      strength: '20 mg',
      form: 'Tablet (Box of 30)',
      quantity: 12,
      price: 24.0,
      expiryDate: '2027-09-15',
      isAvailable: true,
      requiresPrescription: true,
      batchNumber: 'LIP-20-44A',
    },
    {
      id: 'inv-4',
      pharmacyId: 'pharma-001',
      medicineName: 'Lisinopril',
      brand: 'Zestril',
      strength: '10 mg',
      form: 'Tablet (Box of 30)',
      quantity: 6, // Low stock
      price: 11.25,
      expiryDate: '2027-08-30',
      isAvailable: true,
      requiresPrescription: true,
      batchNumber: 'ZES-10-88',
    },
    {
      id: 'inv-5',
      pharmacyId: 'pharma-001',
      medicineName: 'Paracetamol / Acetaminophen',
      brand: 'Panadol Extra',
      strength: '500 mg',
      form: 'Caplets (Pack of 24)',
      quantity: 320,
      price: 6.99,
      expiryDate: '2029-01-31',
      isAvailable: true,
      requiresPrescription: false,
      batchNumber: 'PAN-EXTRA-02',
    },
    {
      id: 'inv-6',
      pharmacyId: 'pharma-001',
      medicineName: 'Amoxicillin Trihydrate',
      brand: 'Amoxil',
      strength: '500 mg',
      form: 'Capsules (Pack of 21)',
      quantity: 0, // Out of stock
      price: 18.0,
      expiryDate: '2027-04-30',
      isAvailable: false,
      requiresPrescription: true,
      batchNumber: 'AMX-500-72',
    },
  ];

  for (const inv of inventory) {
    await prisma.pharmacyInventory.create({ data: inv });
  }

  // 7. Pharmacy Orders
  await prisma.pharmacyOrder.deleteMany();
  const orders = [
    {
      id: 'ord-801',
      pharmacyId: 'pharma-001',
      orderNumber: 'ORD-2026-801',
      patientId: 'pat-101',
      patientName: 'Robert Taylor',
      patientContact: '+1 (555) 234-5678',
      prescriptionRef: 'PR-89410-26 (QR Verified)',
      medicines: [
        { name: 'Atorvastatin Calcium 20 mg', quantity: 1, unitPrice: 24.0 },
      ],
      totalAmount: 24.0,
      orderDate: '2026-11-03 14:15',
      paymentStatus: 'Paid Online',
      fulfillmentStatus: 'Pharmacist Review',
      deliveryType: 'Store Pickup',
      pharmacistNotes: 'Valid digital prescription reference attached.',
    },
    {
      id: 'ord-802',
      pharmacyId: 'pharma-001',
      orderNumber: 'ORD-2026-802',
      patientId: 'pat-102',
      patientName: 'Margaret Davis',
      patientContact: '+1 (555) 876-5432',
      prescriptionRef: 'PR-89411-26',
      medicines: [
        { name: 'Lisinopril 10 mg', quantity: 2, unitPrice: 11.25 },
        { name: 'Panadol Extra 500 mg', quantity: 1, unitPrice: 6.99 },
      ],
      totalAmount: 29.49,
      orderDate: '2026-11-03 11:30',
      paymentStatus: 'Paid Online',
      fulfillmentStatus: 'Ready for Pickup',
      deliveryType: 'Store Pickup',
    },
    {
      id: 'ord-803',
      pharmacyId: 'pharma-001',
      orderNumber: 'ORD-2026-803',
      patientId: 'pat-104',
      patientName: 'David Miller',
      patientContact: '+1 (555) 432-1098',
      medicines: [
        { name: 'Panadol Extra 500 mg', quantity: 2, unitPrice: 6.99 },
      ],
      totalAmount: 13.98,
      orderDate: '2026-11-02 16:40',
      paymentStatus: 'Paid Online',
      fulfillmentStatus: 'Fulfilled',
      deliveryType: 'Home Delivery',
    },
  ];

  for (const ord of orders) {
    await prisma.pharmacyOrder.create({ data: ord });
  }

  // 8. Guardian Links
  await prisma.guardianLink.deleteMany();
  await prisma.guardianLink.create({
    data: {
      id: 'glink-1',
      guardianId: 'guard-001',
      patientId: 'pat-101',
      patientName: 'Robert Taylor',
      relationship: 'Parent',
      consentGranted: true,
      consentLevel: 'Full Medication Overview',
      consentGrantedDate: '2026-10-15',
    },
  });

  await prisma.guardianLink.create({
    data: {
      id: 'glink-2',
      guardianId: 'guard-001',
      patientId: 'pat-102',
      patientName: 'Margaret Davis',
      relationship: 'Aunt',
      consentGranted: true,
      consentLevel: 'Adherence & Alerts Only',
      consentGrantedDate: '2026-10-20',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
