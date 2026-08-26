-- CreateTable
CREATE TABLE "DrinkCategory" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DrinkCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DrinkCategory_tripId_label_key" ON "DrinkCategory"("tripId", "label");

-- AddForeignKey
ALTER TABLE "DrinkCategory" ADD CONSTRAINT "DrinkCategory_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed the four former enum values as default DrinkCategory rows for every existing trip, so
-- existing DrinkEntry rows have something to point at.
INSERT INTO "DrinkCategory" ("id", "tripId", "label", "points", "isDefault", "isActive", "sortOrder")
SELECT gen_random_uuid()::text, "id", 'Bier', 2, true, true, 0 FROM "Trip"
UNION ALL
SELECT gen_random_uuid()::text, "id", 'Shot', 1, true, true, 1 FROM "Trip"
UNION ALL
SELECT gen_random_uuid()::text, "id", 'Cocktail', 3, true, true, 2 FROM "Trip"
UNION ALL
SELECT gen_random_uuid()::text, "id", 'Wein', 2, true, true, 3 FROM "Trip";

-- AlterTable: add the new FK column as nullable first so it can be backfilled
ALTER TABLE "DrinkEntry" ADD COLUMN "categoryId" TEXT;

-- Backfill categoryId from the old enum "type" column, per trip
UPDATE "DrinkEntry" e
SET "categoryId" = dc."id"
FROM "DrinkCategory" dc
WHERE dc."tripId" = e."tripId"
  AND dc."isDefault" = true
  AND dc."label" = CASE e."type"
    WHEN 'BEER' THEN 'Bier'
    WHEN 'SHOT' THEN 'Shot'
    WHEN 'COCKTAIL' THEN 'Cocktail'
    WHEN 'WINE' THEN 'Wein'
  END;

-- Now that every row has a categoryId, enforce it and drop the old enum column/type
ALTER TABLE "DrinkEntry" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "DrinkEntry" DROP COLUMN "type";
DROP TYPE "DrinkType";

-- CreateIndex
CREATE INDEX "DrinkEntry_categoryId_idx" ON "DrinkEntry"("categoryId");

-- AddForeignKey
ALTER TABLE "DrinkEntry" ADD CONSTRAINT "DrinkEntry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DrinkCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
