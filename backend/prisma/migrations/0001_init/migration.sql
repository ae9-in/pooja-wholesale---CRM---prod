-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('NEW', 'CONTACTED', 'QUOTED', 'DELIVERY_PENDING', 'DELIVERED', 'REVISIT_REQUIRED', 'FOLLOW_UP_REQUIRED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CustomerPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('QUOTED', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'REVISIT_DUE');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'UPCOMING', 'DONE', 'OVERDUE', 'SNOOZED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('WHOLESALE_REVISIT_15_DAY');

-- CreateEnum
CREATE TYPE "ProductGroup" AS ENUM ('DHOOP', 'RAW_AGARBATTI', 'CAMPHOR', 'COTTON_WICKS');

-- CreateEnum
CREATE TYPE "FragranceType" AS ENUM ('ROSE', 'SANDALWOOD', 'LAVENDER', 'ALL_IN_1');

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('GENERAL', 'DELIVERY', 'REVISIT', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "ActivityEntityType" AS ENUM ('USER', 'CUSTOMER', 'DELIVERY', 'REMINDER', 'NOTE', 'AUTH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "phoneNumber1" TEXT NOT NULL,
    "phoneNumber2" TEXT,
    "email" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "area" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "description" TEXT,
    "businessType" TEXT NOT NULL,
    "status" "CustomerStatus" NOT NULL DEFAULT 'NEW',
    "priority" "CustomerPriority" NOT NULL DEFAULT 'MEDIUM',
    "source" TEXT,
    "assignedStaffId" TEXT,
    "createdById" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "quoteDate" TIMESTAMP(3) NOT NULL,
    "quotedDeliveryDate" TIMESTAMP(3) NOT NULL,
    "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'QUOTED',
    "totalQuotedValue" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "assignedStaffId" TEXT,
    "billFileUrl" TEXT,
    "billFileName" TEXT,
    "billMimeType" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryItem" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "productGroup" "ProductGroup" NOT NULL,
    "productType" "FragranceType",
    "quantity" INTEGER NOT NULL,
    "packingSize" TEXT NOT NULL,
    "packingQuantity" INTEGER NOT NULL,
    "quotedPrice" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "deliveryId" TEXT,
    "reminderType" "ReminderType" NOT NULL,
    "reminderDate" TIMESTAMP(3) NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedStaffId" TEXT,
    "completedAt" TIMESTAMP(3),
    "snoozedUntil" TIMESTAMP(3),
    "completionNote" TEXT,
    "createdBySystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "deliveryId" TEXT,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "noteType" "NoteType" NOT NULL DEFAULT 'GENERAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "entityType" "ActivityEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actorId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Customer_assignedStaffId_idx" ON "Customer"("assignedStaffId");

-- CreateIndex
CREATE INDEX "Customer_status_idx" ON "Customer"("status");

-- CreateIndex
CREATE INDEX "Customer_city_idx" ON "Customer"("city");

-- CreateIndex
CREATE INDEX "Delivery_customerId_idx" ON "Delivery"("customerId");

-- CreateIndex
CREATE INDEX "Delivery_quotedDeliveryDate_idx" ON "Delivery"("quotedDeliveryDate");

-- CreateIndex
CREATE INDEX "Delivery_deliveryStatus_idx" ON "Delivery"("deliveryStatus");

-- CreateIndex
CREATE INDEX "Reminder_status_idx" ON "Reminder"("status");

-- CreateIndex
CREATE INDEX "Reminder_reminderDate_idx" ON "Reminder"("reminderDate");

-- CreateIndex
CREATE UNIQUE INDEX "Reminder_deliveryId_reminderType_key" ON "Reminder"("deliveryId", "reminderType");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_entityId_idx" ON "ActivityLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryItem" ADD CONSTRAINT "DeliveryItem_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

