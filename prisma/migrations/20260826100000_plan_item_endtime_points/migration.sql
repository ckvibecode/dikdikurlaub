-- AlterEnum
ALTER TYPE "PointsSource" ADD VALUE 'PLAN_ITEM';

-- AlterTable
ALTER TABLE "PlanItem" ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;
