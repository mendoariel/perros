/*
  Warnings:

  - The values [DISABLED] on the enum `State` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "State_new" AS ENUM ('VIRGIN', 'ENABLED', 'DISABLEDn', 'DEAD', 'REGISTER_PROCESS');
ALTER TABLE "medals" ALTER COLUMN "status" TYPE "State_new" USING ("status"::text::"State_new");
ALTER TYPE "State" RENAME TO "State_old";
ALTER TYPE "State_new" RENAME TO "State";
DROP TYPE "State_old";
COMMIT;
