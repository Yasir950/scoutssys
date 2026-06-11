-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPERATOR_REGISTRATION', 'OPERATOR_INVENTORY', 'VIEWER');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('AVAILABLE', 'ISSUED', 'DAMAGED', 'LOST', 'UNDER_MAINTENANCE');

-- CreateEnum
CREATE TYPE "ItemCondition" AS ENUM ('NEW', 'GOOD', 'USED', 'DAMAGED');

-- CreateEnum
CREATE TYPE "FineStatus" AS ENUM ('PENDING', 'PAID', 'WAIVED');

-- CreateEnum
CREATE TYPE "ReturnCondition" AS ENUM ('GOOD', 'DAMAGED', 'LOST');

-- CreateEnum
CREATE TYPE "ShiftType" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'FULL_DAY');

-- CreateEnum
CREATE TYPE "ExchangeReason" AS ENUM ('BATTERY_LOW', 'TORN', 'DAMAGED', 'SIZE_ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'UBL', 'JAZZCASH', 'EASYPAISA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OPERATOR_REGISTRATION',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scouts" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "cnicOrBForm" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "emergencyContact" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "unitName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "bloodGroup" "BloodGroup" NOT NULL,
    "hasPreviousExperience" BOOLEAN NOT NULL DEFAULT false,
    "photoPath" TEXT,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registeredBy" TEXT NOT NULL,

    CONSTRAINT "scouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duty_departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "duty_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duty_assignments" (
    "id" TEXT NOT NULL,
    "scoutId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "gateName" TEXT NOT NULL,
    "shift" "ShiftType" NOT NULL,
    "reportingTime" TEXT NOT NULL,
    "inchargeName" TEXT NOT NULL,
    "notes" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "duty_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cabin_shelves" (
    "id" TEXT NOT NULL,
    "cabinNumber" TEXT NOT NULL,
    "shelfLabel" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cabin_shelves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "tagNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'AVAILABLE',
    "condition" "ItemCondition" NOT NULL DEFAULT 'NEW',
    "originalPrice" DECIMAL(10,2) NOT NULL,
    "cabinShelfId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issued_items" (
    "id" TEXT NOT NULL,
    "scoutId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedBy" TEXT NOT NULL,
    "returnedAt" TIMESTAMP(3),
    "returnCondition" "ReturnCondition",
    "guarantorId" TEXT,

    CONSTRAINT "issued_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guarantors" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "cnicNumber" TEXT NOT NULL,
    "depositedItemDescription" TEXT NOT NULL,
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guarantors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_records" (
    "id" TEXT NOT NULL,
    "issuedItemId" TEXT NOT NULL,
    "condition" "ReturnCondition" NOT NULL,
    "notes" TEXT,
    "returnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedBy" TEXT NOT NULL,

    CONSTRAINT "return_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fines" (
    "id" TEXT NOT NULL,
    "scoutId" TEXT NOT NULL,
    "issuedItemId" TEXT NOT NULL,
    "originalPrice" DECIMAL(10,2) NOT NULL,
    "finePercentage" DECIMAL(5,2) NOT NULL,
    "fineAmount" DECIMAL(10,2) NOT NULL,
    "status" "FineStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod",
    "paidAt" TIMESTAMP(3),
    "waivedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_records" (
    "id" TEXT NOT NULL,
    "issuedItemId" TEXT NOT NULL,
    "oldItemId" TEXT NOT NULL,
    "newItemId" TEXT NOT NULL,
    "reason" "ExchangeReason" NOT NULL,
    "notes" TEXT,
    "exchangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedBy" TEXT NOT NULL,

    CONSTRAINT "exchange_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_role_idx" ON "users"("email", "role");

-- CreateIndex
CREATE UNIQUE INDEX "scouts_registrationNumber_key" ON "scouts"("registrationNumber");

-- CreateIndex
CREATE INDEX "scouts_registrationNumber_idx" ON "scouts"("registrationNumber");

-- CreateIndex
CREATE INDEX "scouts_contactNumber_idx" ON "scouts"("contactNumber");

-- CreateIndex
CREATE INDEX "scouts_fullName_idx" ON "scouts"("fullName");

-- CreateIndex
CREATE INDEX "scouts_cnicOrBForm_idx" ON "scouts"("cnicOrBForm");

-- CreateIndex
CREATE UNIQUE INDEX "duty_departments_name_key" ON "duty_departments"("name");

-- CreateIndex
CREATE INDEX "duty_assignments_scoutId_idx" ON "duty_assignments"("scoutId");

-- CreateIndex
CREATE INDEX "duty_assignments_departmentId_idx" ON "duty_assignments"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_categories_name_key" ON "inventory_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cabin_shelves_cabinNumber_shelfLabel_key" ON "cabin_shelves"("cabinNumber", "shelfLabel");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_tagNumber_key" ON "inventory_items"("tagNumber");

-- CreateIndex
CREATE INDEX "inventory_items_tagNumber_idx" ON "inventory_items"("tagNumber");

-- CreateIndex
CREATE INDEX "inventory_items_categoryId_status_idx" ON "inventory_items"("categoryId", "status");

-- CreateIndex
CREATE INDEX "inventory_items_cabinShelfId_idx" ON "inventory_items"("cabinShelfId");

-- CreateIndex
CREATE INDEX "issued_items_scoutId_idx" ON "issued_items"("scoutId");

-- CreateIndex
CREATE INDEX "issued_items_inventoryItemId_idx" ON "issued_items"("inventoryItemId");

-- CreateIndex
CREATE INDEX "issued_items_guarantorId_idx" ON "issued_items"("guarantorId");

-- CreateIndex
CREATE UNIQUE INDEX "return_records_issuedItemId_key" ON "return_records"("issuedItemId");

-- CreateIndex
CREATE UNIQUE INDEX "fines_issuedItemId_key" ON "fines"("issuedItemId");

-- CreateIndex
CREATE INDEX "fines_scoutId_idx" ON "fines"("scoutId");

-- CreateIndex
CREATE INDEX "fines_status_idx" ON "fines"("status");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_records_issuedItemId_key" ON "exchange_records"("issuedItemId");

-- CreateIndex
CREATE INDEX "exchange_records_oldItemId_idx" ON "exchange_records"("oldItemId");

-- CreateIndex
CREATE INDEX "exchange_records_newItemId_idx" ON "exchange_records"("newItemId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_resource_action_idx" ON "audit_logs"("resource", "action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- AddForeignKey
ALTER TABLE "duty_assignments" ADD CONSTRAINT "duty_assignments_scoutId_fkey" FOREIGN KEY ("scoutId") REFERENCES "scouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duty_assignments" ADD CONSTRAINT "duty_assignments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "duty_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "inventory_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_cabinShelfId_fkey" FOREIGN KEY ("cabinShelfId") REFERENCES "cabin_shelves"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_items" ADD CONSTRAINT "issued_items_scoutId_fkey" FOREIGN KEY ("scoutId") REFERENCES "scouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_items" ADD CONSTRAINT "issued_items_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issued_items" ADD CONSTRAINT "issued_items_guarantorId_fkey" FOREIGN KEY ("guarantorId") REFERENCES "guarantors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_records" ADD CONSTRAINT "return_records_issuedItemId_fkey" FOREIGN KEY ("issuedItemId") REFERENCES "issued_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fines" ADD CONSTRAINT "fines_scoutId_fkey" FOREIGN KEY ("scoutId") REFERENCES "scouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fines" ADD CONSTRAINT "fines_issuedItemId_fkey" FOREIGN KEY ("issuedItemId") REFERENCES "issued_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_records" ADD CONSTRAINT "exchange_records_issuedItemId_fkey" FOREIGN KEY ("issuedItemId") REFERENCES "issued_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_records" ADD CONSTRAINT "exchange_records_oldItemId_fkey" FOREIGN KEY ("oldItemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_records" ADD CONSTRAINT "exchange_records_newItemId_fkey" FOREIGN KEY ("newItemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
