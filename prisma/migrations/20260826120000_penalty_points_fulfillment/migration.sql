-- AlterEnum
ALTER TYPE "PointsSource" ADD VALUE 'PENALTY';

-- AlterTable
ALTER TABLE "PenaltyEntry" ADD COLUMN     "fulfilledAt" TIMESTAMP(3),
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PenaltyType" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

-- Backfill sensible point values on the seeded default catalog entries (admin can adjust later)
UPDATE "PenaltyType" SET points = 5 WHERE title = 'Handy verloren/versenkt';
UPDATE "PenaltyType" SET points = 2 WHERE title = 'Zu spät zum Treffpunkt';
UPDATE "PenaltyType" SET points = 1 WHERE title = 'Sonnenbrand nicht vermieden';
UPDATE "PenaltyType" SET points = 2 WHERE title = 'Peinlicher Fotomoment verursacht';
UPDATE "PenaltyType" SET points = 1 WHERE title = 'Getränk verschüttet';
UPDATE "PenaltyType" SET points = 2 WHERE title = 'Im Restaurant eingeschlafen';
UPDATE "PenaltyType" SET points = 2 WHERE title = 'Falsche Richtung geführt';
