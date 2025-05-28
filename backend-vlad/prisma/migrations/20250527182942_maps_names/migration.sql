/*
  Warnings:

  - You are about to drop the column `createdAt` on the `medals` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `medals` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `medals` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `hashPasswordRecovery` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `hashedRt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `userStatus` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `virgin_medals` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `virgin_medals` table. All the data in the column will be lost.
  - Added the required column `owner_id` to the `medals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_status` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "medals" DROP CONSTRAINT "medals_ownerId_fkey";

-- AlterTable
ALTER TABLE "medals" DROP COLUMN "createdAt",
DROP COLUMN "ownerId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "owner_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "hashPasswordRecovery",
DROP COLUMN "hashedRt",
DROP COLUMN "updatedAt",
DROP COLUMN "userStatus",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "hash_password_recovery" TEXT,
ADD COLUMN     "hashed_rt" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_status" "UserStatus" NOT NULL;

-- AlterTable
ALTER TABLE "virgin_medals" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "medals" ADD CONSTRAINT "medals_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
