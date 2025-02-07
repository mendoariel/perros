/*
  Warnings:

  - Added the required column `ownerId` to the `medals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "medals" ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "medals" ADD CONSTRAINT "medals_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
