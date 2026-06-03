-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "profitAssumptions" JSONB;

-- CreateTable
CREATE TABLE "ProfitAnalysis" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "analysisVersion" TEXT NOT NULL DEFAULT 'v1',
    "revenue" DECIMAL(10,2) NOT NULL,
    "margin" DECIMAL(10,2) NOT NULL,
    "marginPercent" DECIMAL(5,2) NOT NULL,
    "breakEvenCpl" DECIMAL(10,2) NOT NULL,
    "breakEvenCpa" DECIMAL(10,2) NOT NULL,
    "targetCpl" DECIMAL(10,2) NOT NULL,
    "targetCpa" DECIMAL(10,2) NOT NULL,
    "minCpl" DECIMAL(10,2) NOT NULL,
    "recommendedCpl" DECIMAL(10,2) NOT NULL,
    "maxCpl" DECIMAL(10,2) NOT NULL,
    "assumptions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfitAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfitAnalysis_projectId_idx" ON "ProfitAnalysis"("projectId");

-- CreateIndex
CREATE INDEX "ProfitAnalysis_createdAt_idx" ON "ProfitAnalysis"("createdAt");

-- AddForeignKey
ALTER TABLE "ProfitAnalysis" ADD CONSTRAINT "ProfitAnalysis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
