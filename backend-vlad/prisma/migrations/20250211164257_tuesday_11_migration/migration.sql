/*
  Warnings:

  - The values [DISABLEDn] on the enum `MedalState` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `registerHash` on table `medals` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MedalState_new" AS ENUM ('VIRGIN', 'ENABLED', 'DISABLED', 'DEAD', 'REGISTER_PROCESS', 'PENDING_CONFIRMATION', 'INCOMPLETE');
ALTER TABLE "medals" ALTER COLUMN "status" TYPE "MedalState_new" USING ("status"::text::"MedalState_new");
ALTER TABLE "virgin_medals" ALTER COLUMN "status" TYPE "MedalState_new" USING ("status"::text::"MedalState_new");
ALTER TYPE "MedalState" RENAME TO "MedalState_old";
ALTER TYPE "MedalState_new" RENAME TO "MedalState";
DROP TYPE "MedalState_old";
COMMIT;

-- AlterTable
ALTER TABLE "medals" ALTER COLUMN "registerHash" SET NOT NULL;
