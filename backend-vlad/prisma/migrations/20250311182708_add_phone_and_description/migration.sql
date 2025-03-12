/*
  Warnings:

  - You are about to drop the column `medalString` on the `medals` table. All the data in the column will be lost.
  - You are about to drop the column `petName` on the `medals` table. All the data in the column will be lost.
  - You are about to drop the column `registerHash` on the `medals` table. All the data in the column will be lost.
  - You are about to drop the column `hashToRegister` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `medalString` on the `virgin_medals` table. All the data in the column will be lost.
  - You are about to drop the column `registerHash` on the `virgin_medals` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[medal_string]` on the table `medals` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[medal_string]` on the table `virgin_medals` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `medals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medal_string` to the `medals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pet_name` to the `medals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `register_hash` to the `medals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hash_to_register` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medal_string` to the `virgin_medals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `register_hash` to the `virgin_medals` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "medals_medalString_key";

-- DropIndex
DROP INDEX "virgin_medals_medalString_key";

-- DropIndex
DROP INDEX "virgin_medals_registerHash_key";

-- AlterTable
ALTER TABLE "medals" DROP COLUMN "medalString",
DROP COLUMN "petName",
DROP COLUMN "registerHash",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "medal_string" TEXT NOT NULL,
ADD COLUMN     "pet_name" TEXT NOT NULL,
ADD COLUMN     "register_hash" TEXT NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "hashToRegister",
ADD COLUMN     "hash_to_register" TEXT NOT NULL,
ADD COLUMN     "phonenumber" TEXT,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "virgin_medals" DROP COLUMN "medalString",
DROP COLUMN "registerHash",
ADD COLUMN     "medal_string" TEXT NOT NULL,
ADD COLUMN     "register_hash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "medals_medal_string_key" ON "medals"("medal_string");

-- CreateIndex
CREATE UNIQUE INDEX "virgin_medals_medal_string_key" ON "virgin_medals"("medal_string");
