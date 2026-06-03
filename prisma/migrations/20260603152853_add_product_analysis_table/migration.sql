-- CreateTable
CREATE TABLE "ProductAnalysis" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "analysisVersion" TEXT NOT NULL DEFAULT 'v1',
    "category" TEXT,
    "demand" "DemandLevel",
    "competition" "CompetitionLevel",
    "emotionalTriggers" JSONB,
    "difficultyScore" INTEGER,
    "marketOpportunity" INTEGER,
    "riskScore" "RiskScore",
    "marketScore" INTEGER,
    "productScore" INTEGER,
    "strengths" JSONB,
    "weaknesses" JSONB,
    "targetAudience" JSONB,
    "pricingRecommendations" JSONB,
    "risks" JSONB,
    "mediaBuyerReport" JSONB,
    "opportunityScoreInputs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductAnalysis_projectId_idx" ON "ProductAnalysis"("projectId");

-- CreateIndex
CREATE INDEX "ProductAnalysis_createdAt_idx" ON "ProductAnalysis"("createdAt");

-- AddForeignKey
ALTER TABLE "ProductAnalysis" ADD CONSTRAINT "ProductAnalysis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
