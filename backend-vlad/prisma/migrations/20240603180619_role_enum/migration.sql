/*
  Warnings:

  - Added the required column `superpower` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('VISITOR', 'FRIAS_EDITOR', 'REGISTER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "superpower" TEXT NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;
