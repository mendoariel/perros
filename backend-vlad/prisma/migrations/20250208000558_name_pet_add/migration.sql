/*
  Warnings:

  - Added the required column `namePet` to the `medals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "medals" ADD COLUMN     "namePet" TEXT NOT NULL;
