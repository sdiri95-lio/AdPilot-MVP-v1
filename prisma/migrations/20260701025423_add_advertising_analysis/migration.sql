-- CreateTable
CREATE TABLE "AdvertisingAnalysis" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "csvUploadId" TEXT,
    "campaignHealthScore" INTEGER NOT NULL,
    "overallDecision" TEXT NOT NULL,
    "confidenceScore" INTEGER NOT NULL,
    "creativeRanking" JSONB NOT NULL,
    "winningAdSets" JSONB NOT NULL,
    "losingAdSets" JSONB NOT NULL,
    "fatigueWarnings" JSONB NOT NULL,
    "businessIntel" JSONB NOT NULL,
    "optimizationActions" JSONB NOT NULL,
    "actionPlan" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdvertisingAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdvertisingAnalysis_csvUploadId_key" ON "AdvertisingAnalysis"("csvUploadId");

-- CreateIndex
CREATE INDEX "AdvertisingAnalysis_projectId_idx" ON "AdvertisingAnalysis"("projectId");

-- AddForeignKey
ALTER TABLE "AdvertisingAnalysis" ADD CONSTRAINT "AdvertisingAnalysis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisingAnalysis" ADD CONSTRAINT "AdvertisingAnalysis_csvUploadId_fkey" FOREIGN KEY ("csvUploadId") REFERENCES "CsvUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
