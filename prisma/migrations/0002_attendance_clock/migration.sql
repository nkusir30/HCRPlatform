-- AlterTable: add real-time clock-punch fields to "attendances"
-- (web Attendance type captures clockInAt/clockOutAt/source/houseId/scheduleId)
ALTER TABLE "attendances" ADD COLUMN "scheduleId" TEXT,
ADD COLUMN "houseId" TEXT,
ADD COLUMN "clockInAt" TIMESTAMP(3),
ADD COLUMN "clockOutAt" TIMESTAMP(3),
ADD COLUMN "source" TEXT NOT NULL DEFAULT 'web';
