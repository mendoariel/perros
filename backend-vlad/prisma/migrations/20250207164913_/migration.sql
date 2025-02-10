/*
  Warnings:

  - You are about to drop the column `medalHash` on the `medals` table. All the data in the column will be lost.
  - You are about to drop the column `medalHash` on the `virgin_medals` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[medalString]` on the table `medals` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[registerHash]` on the table `virgin_medals` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `medalString` to the `medals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registerHash` to the `virgin_medals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `virgin_medals` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "medals_medalHash_key";

-- DropIndex
DROP INDEX "virgin_medals_medalHash_key";

-- AlterTable
ALTER TABLE "medals" DROP COLUMN "medalHash",
ADD COLUMN     "medalString" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "virgin_medals" DROP COLUMN "medalHash",
ADD COLUMN     "registerHash" TEXT NOT NULL,
ADD COLUMN     "status" "State" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "medals_medalString_key" ON "medals"("medalString");

-- CreateIndex
CREATE UNIQUE INDEX "virgin_medals_registerHash_key" ON "virgin_medals"("registerHash");
