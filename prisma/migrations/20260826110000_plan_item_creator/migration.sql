-- AlterTable: add nullable first so existing rows can be backfilled
ALTER TABLE "PlanItem" ADD COLUMN "createdByMemberId" TEXT;

-- Backfill: existing plan items (created before this feature existed) are attributed to the
-- trip's admin member, since that is the best available default.
UPDATE "PlanItem" p
SET "createdByMemberId" = (
  SELECT m.id FROM "Member" m WHERE m."tripId" = p."tripId" AND m.role = 'ADMIN' LIMIT 1
)
WHERE "createdByMemberId" IS NULL;

-- Now that every row has a value, enforce it
ALTER TABLE "PlanItem" ALTER COLUMN "createdByMemberId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "PlanItem_createdByMemberId_idx" ON "PlanItem"("createdByMemberId");

-- AddForeignKey
ALTER TABLE "PlanItem" ADD CONSTRAINT "PlanItem_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
