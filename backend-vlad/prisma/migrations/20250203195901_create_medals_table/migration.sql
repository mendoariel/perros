-- CreateEnum
CREATE TYPE "State" AS ENUM ('VIRGIN', 'ENABLED', 'DISABLED', 'DEAD');

-- CreateTable
CREATE TABLE "medals" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "hash" TEXT NOT NULL,
    "status" "State" NOT NULL,

    CONSTRAINT "medals_pkey" PRIMARY KEY ("id")
);
