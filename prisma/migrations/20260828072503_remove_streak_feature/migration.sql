-- AlterEnum
BEGIN;
CREATE TYPE "PointsSource_new" AS ENUM ('CHALLENGE', 'DRINK_RANKING', 'PLAN_ITEM', 'PENALTY', 'AWARD', 'ADMIN_ADJUST');
ALTER TABLE "PointsLedger" ALTER COLUMN "source" TYPE "PointsSource_new" USING ("source"::text::"PointsSource_new");
ALTER TYPE "PointsSource" RENAME TO "PointsSource_old";
ALTER TYPE "PointsSource_new" RENAME TO "PointsSource";
DROP TYPE "public"."PointsSource_old";
COMMIT;

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "currentStreak",
DROP COLUMN "lastActiveDay",
DROP COLUMN "longestStreak";

