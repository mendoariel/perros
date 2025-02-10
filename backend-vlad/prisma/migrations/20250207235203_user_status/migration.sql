/*
  Warnings:

  - Added the required column `userStatus` to the `owner_medal_user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING', 'DISABLED');

-- AlterTable
ALTER TABLE "owner_medal_user" ADD COLUMN     "userStatus" "UserStatus" NOT NULL;
