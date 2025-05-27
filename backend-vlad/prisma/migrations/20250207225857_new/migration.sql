-- AlterEnum
-- ALTER TYPE "State" ADD VALUE 'PENDING_CONFIRMATION';

-- DropForeignKey
ALTER TABLE "medals" DROP CONSTRAINT "medals_ownerId_fkey";

-- CreateTable
CREATE TABLE "owner_medal_user" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "owner_medal_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "owner_medal_user_email_key" ON "owner_medal_user"("email");

-- AddForeignKey
ALTER TABLE "medals" ADD CONSTRAINT "medals_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owner_medal_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
