/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `medals` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "medals_hash_key" ON "medals"("hash");
