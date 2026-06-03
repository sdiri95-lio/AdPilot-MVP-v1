-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "opportunityReasoning" JSONB,
ADD COLUMN     "opportunityRecommendation" TEXT;

-- CreateTable
CREATE TABLE "WinningProbabilityAnalysis" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "analysisVersion" TEXT NOT NULL DEFAULT 'v1',
    "winningProbability" INTEGER NOT NULL,
    "confidenceScore" INTEGER NOT NULL,
    "reasoning" JSONB NOT NULL,
    "recommendation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WinningProbabilityAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WinningProbabilityAnalysis_projectId_idx" ON "WinningProbabilityAnalysis"("projectId");

-- CreateIndex
CREATE INDEX "WinningProbabilityAnalysis_createdAt_idx" ON "WinningProbabilityAnalysis"("createdAt");

-- AddForeignKey
ALTER TABLE "WinningProbabilityAnalysis" ADD CONSTRAINT "WinningProbabilityAnalysis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
