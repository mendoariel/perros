/*
  Warnings:

  - You are about to drop the `owner_medal_user` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `hashToRegister` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userStatus` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "medals" DROP CONSTRAINT "medals_ownerId_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "hashToRegister" TEXT NOT NULL,
ADD COLUMN     "userStatus" "UserStatus" NOT NULL;

-- DropTable
DROP TABLE "owner_medal_user";

-- AddForeignKey
ALTER TABLE "medals" ADD CONSTRAINT "medals_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
