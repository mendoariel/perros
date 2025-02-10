/*
  Warnings:

  - Changed the type of `status` on the `medals` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `virgin_medals` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MedalState" AS ENUM ('VIRGIN', 'ENABLED', 'DISABLEDn', 'DEAD', 'REGISTER_PROCESS', 'PENDING_CONFIRMATION');

-- AlterTable
ALTER TABLE "medals" DROP COLUMN "status",
ADD COLUMN     "status" "MedalState" NOT NULL;

-- AlterTable
ALTER TABLE "virgin_medals" DROP COLUMN "status",
ADD COLUMN     "status" "MedalState" NOT NULL;

-- DropEnum
DROP TYPE "State";
