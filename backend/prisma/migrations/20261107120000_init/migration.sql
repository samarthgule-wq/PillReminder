-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT,
    "avatarLetter" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "bloodGroup" TEXT NOT NULL,
    "allergies" TEXT[],
    "chronicConditions" TEXT[],
    "adherenceRate" DOUBLE PRECISION NOT NULL DEFAULT 90.0,
    "emergencyContact" TEXT,
    "lastConsultation" TEXT,
    "nextFollowUp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "prescriptionNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "patientAge" INTEGER NOT NULL DEFAULT 64,
    "patientGender" TEXT NOT NULL DEFAULT 'Male',
    "doctorId" TEXT NOT NULL,
    "doctorName" TEXT NOT NULL,
    "doctorSpecialty" TEXT NOT NULL,
    "clinicOrHospital" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "doctorNotes" TEXT,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_items" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "medicineName" TEXT NOT NULL,
    "strength" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "startDate" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "reminderTimes" TEXT[],
    "notes" TEXT,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_reminders" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "prescriptionId" TEXT,
    "medicineName" TEXT NOT NULL,
    "strength" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "acknowledgedAt" TIMESTAMP(3),
    "prescribingDoctor" TEXT,
    "remainingDays" INTEGER NOT NULL DEFAULT 30,
    "scheduledDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medication_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_history" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medicineName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actionTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "selfReported" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "medication_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_inventory" (
    "id" TEXT NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "medicineName" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "strength" TEXT NOT NULL,
    "form" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "expiryDate" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "requiresPrescription" BOOLEAN NOT NULL DEFAULT true,
    "batchNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacy_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_orders" (
    "id" TEXT NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "patientId" TEXT,
    "patientName" TEXT NOT NULL,
    "patientContact" TEXT NOT NULL,
    "prescriptionRef" TEXT,
    "medicines" JSONB NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "fulfillmentStatus" TEXT NOT NULL,
    "deliveryType" TEXT NOT NULL,
    "orderDate" TEXT NOT NULL,
    "pharmacistNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacy_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardian_links" (
    "id" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "consentGranted" BOOLEAN NOT NULL DEFAULT true,
    "consentLevel" TEXT NOT NULL,
    "consentGrantedDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guardian_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "toolCalls" JSONB,
    "toolResults" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patient_profiles_userId_key" ON "patient_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "prescriptions_prescriptionNumber_key" ON "prescriptions"("prescriptionNumber");

-- CreateIndex
CREATE INDEX "prescriptions_patientId_idx" ON "prescriptions"("patientId");

-- CreateIndex
CREATE INDEX "prescriptions_doctorId_idx" ON "prescriptions"("doctorId");

-- CreateIndex
CREATE INDEX "medication_reminders_patientId_scheduledDate_idx" ON "medication_reminders"("patientId", "scheduledDate");

-- CreateIndex
CREATE INDEX "medication_history_patientId_actionTimestamp_idx" ON "medication_history"("patientId", "actionTimestamp");

-- CreateIndex
CREATE INDEX "pharmacy_inventory_pharmacyId_medicineName_idx" ON "pharmacy_inventory"("pharmacyId", "medicineName");

-- CreateIndex
CREATE UNIQUE INDEX "pharmacy_orders_orderNumber_key" ON "pharmacy_orders"("orderNumber");

-- CreateIndex
CREATE INDEX "pharmacy_orders_pharmacyId_fulfillmentStatus_idx" ON "pharmacy_orders"("pharmacyId", "fulfillmentStatus");

-- CreateIndex
CREATE INDEX "guardian_links_guardianId_patientId_idx" ON "guardian_links"("guardianId", "patientId");

-- CreateIndex
CREATE INDEX "ai_conversations_userId_userRole_idx" ON "ai_conversations"("userId", "userRole");

-- CreateIndex
CREATE INDEX "ai_messages_conversationId_createdAt_idx" ON "ai_messages"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
