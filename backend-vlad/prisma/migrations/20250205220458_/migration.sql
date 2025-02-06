/*
  Warnings:

  - You are about to drop the column `hash` on the `medals` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[medalHash]` on the table `medals` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `medalHash` to the `medals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `medals` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "medals_hash_key";

-- AlterTable
ALTER TABLE "medals" DROP COLUMN "hash",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "medalHash" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "medals_medalHash_key" ON "medals"("medalHash");
