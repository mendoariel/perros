/*
  Warnings:

  - Added the required column `hashToRegister` to the `owner_medal_user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "owner_medal_user" ADD COLUMN     "hashToRegister" TEXT NOT NULL;
