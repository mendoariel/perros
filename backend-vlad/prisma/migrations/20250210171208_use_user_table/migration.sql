/*
  Warnings:

  - You are about to drop the column `superpower` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "superpower",
ALTER COLUMN "username" DROP NOT NULL;
