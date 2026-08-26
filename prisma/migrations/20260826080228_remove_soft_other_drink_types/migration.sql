-- AlterEnum
BEGIN;
CREATE TYPE "DrinkType_new" AS ENUM ('BEER', 'SHOT', 'COCKTAIL', 'WINE');
ALTER TABLE "DrinkEntry" ALTER COLUMN "type" TYPE "DrinkType_new" USING ("type"::text::"DrinkType_new");
ALTER TYPE "DrinkType" RENAME TO "DrinkType_old";
ALTER TYPE "DrinkType_new" RENAME TO "DrinkType";
DROP TYPE "public"."DrinkType_old";
COMMIT;
