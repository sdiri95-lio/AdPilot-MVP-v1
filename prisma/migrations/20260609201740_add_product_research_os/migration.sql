-- CreateEnum
CREATE TYPE "ResearchStatus" AS ENUM ('RESEARCHING', 'READY_FOR_TEST', 'REJECTED', 'WINNER');

-- CreateEnum
CREATE TYPE "MediaBuyingTestStatus" AS ENUM ('RESEARCH', 'READY', 'PREPARING', 'LAUNCHING', 'TESTING', 'ANALYSIS', 'WINNER', 'FAILED', 'RETEST');

-- AlterTable
ALTER TABLE "CsvUpload" ADD COLUMN     "mediaBuyingTestId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "adLibraryLinks" JSONB,
ADD COLUMN     "codFriendly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "competitorLinks" JSONB,
ADD COLUMN     "dailyUse" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "easyToDemonstrate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "goodMargin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lightweight" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "productVideos" JSONB,
ADD COLUMN     "researchScore" INTEGER,
ADD COLUMN     "researchStatus" "ResearchStatus" NOT NULL DEFAULT 'RESEARCHING',
ADD COLUMN     "solvesProblem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supplierLink" TEXT,
ADD COLUMN     "sustainableDemand" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "viralPotential" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "weight" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "MediaBuyingTest" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "launchDate" TIMESTAMP(3),
    "offer" TEXT,
    "creative" TEXT,
    "landingPage" TEXT,
    "dailyBudget" DECIMAL(10,2),
    "status" "MediaBuyingTestStatus" NOT NULL DEFAULT 'RESEARCH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaBuyingTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaBuyingTest_projectId_idx" ON "MediaBuyingTest"("projectId");

-- CreateIndex
CREATE INDEX "CountryNote_userId_idx" ON "CountryNote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CountryNote_userId_country_key" ON "CountryNote"("userId", "country");

-- AddForeignKey
ALTER TABLE "CsvUpload" ADD CONSTRAINT "CsvUpload_mediaBuyingTestId_fkey" FOREIGN KEY ("mediaBuyingTestId") REFERENCES "MediaBuyingTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaBuyingTest" ADD CONSTRAINT "MediaBuyingTest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryNote" ADD CONSTRAINT "CountryNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
