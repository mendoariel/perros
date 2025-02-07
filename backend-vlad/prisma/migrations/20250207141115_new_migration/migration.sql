-- CreateTable
CREATE TABLE "virgin_medals" (
    "id" SERIAL NOT NULL,
    "medalString" TEXT NOT NULL,
    "medalHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virgin_medals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "virgin_medals_medalString_key" ON "virgin_medals"("medalString");

-- CreateIndex
CREATE UNIQUE INDEX "virgin_medals_medalHash_key" ON "virgin_medals"("medalHash");
