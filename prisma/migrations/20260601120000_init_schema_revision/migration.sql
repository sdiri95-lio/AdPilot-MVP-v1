-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE_TRIAL', 'STARTER', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('IMPULSE', 'PROBLEM_SOLVER', 'TRENDING', 'UTILITY', 'SEASONAL');

-- CreateEnum
CREATE TYPE "DemandLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "CompetitionLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "RiskScore" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "TestScenario" AS ENUM ('MINIMUM', 'BEST', 'HIGH');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('ABO', 'CBO');

-- CreateEnum
CREATE TYPE "TargetingType" AS ENUM ('TARGET', 'BROAD');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('CPM', 'CTR', 'CPL', 'CPA', 'ROAS');

-- CreateEnum
CREATE TYPE "CsvStatus" AS ENUM ('PENDING', 'PROCESSING', 'ANALYZED', 'ERROR');

-- CreateEnum
CREATE TYPE "ScalingType" AS ENUM ('VERTICAL', 'HORIZONTAL', 'BUDGET');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "imageUrl" TEXT,
    "subscription" "SubscriptionTier" NOT NULL DEFAULT 'FREE_TRIAL',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activeProjectCount" INTEGER NOT NULL DEFAULT 0,
    "aiCallsUsed" INTEGER NOT NULL DEFAULT 0,
    "aiCallsLimit" INTEGER NOT NULL DEFAULT 50,
    "projectLimit" INTEGER NOT NULL DEFAULT 5,
    "resetAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "name" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productUrl" TEXT,
    "imageUrl" TEXT,
    "country" TEXT,
    "targetCountry" TEXT,
    "productType" "ProductType",
    "productCost" DECIMAL(10,2) NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "shippingCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "serviceFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "desiredProfit" DECIMAL(5,2) NOT NULL,
    "category" TEXT,
    "demand" "DemandLevel",
    "competition" "CompetitionLevel",
    "emotionalTriggers" JSONB,
    "difficultyScore" INTEGER,
    "marketOpportunity" INTEGER,
    "winningProbability" DECIMAL(5,2),
    "confidenceScore" DECIMAL(5,2),
    "analysisVersion" TEXT NOT NULL DEFAULT 'v1',
    "mediaBuyerReport" JSONB,
    "riskScore" "RiskScore",
    "marketScore" INTEGER,
    "productScore" INTEGER,
    "revenue" DECIMAL(10,2),
    "margin" DECIMAL(10,2),
    "marginPercent" DECIMAL(5,2),
    "breakEvenCpl" DECIMAL(10,2),
    "breakEvenCpa" DECIMAL(10,2),
    "targetCpl" DECIMAL(10,2),
    "targetCpa" DECIMAL(10,2),
    "minCpl" DECIMAL(10,2),
    "recommendedCpl" DECIMAL(10,2),
    "maxCpl" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "scenario" "TestScenario" NOT NULL,
    "campaignType" "CampaignType" NOT NULL,
    "adsetCount" INTEGER NOT NULL,
    "budgetPerAdset" DECIMAL(10,2) NOT NULL,
    "totalBudget" DECIMAL(10,2) NOT NULL,
    "targetingType" "TargetingType" NOT NULL,
    "targetingDetails" JSONB,
    "expectedSpend" DECIMAL(10,2) NOT NULL,
    "expectedLeads" INTEGER NOT NULL,
    "expectedOrders" INTEGER NOT NULL,
    "expectedRisk" "RiskScore" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdCopy" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "hooks" JSONB NOT NULL,
    "headlines" JSONB NOT NULL,
    "primaryTexts" JSONB NOT NULL,
    "ctaVariations" JSONB NOT NULL,
    "marketLocale" TEXT NOT NULL DEFAULT 'AFRICA_GENERAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdCopy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Benchmark" (
    "id" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "metricType" "MetricType" NOT NULL,
    "avgValue" DECIMAL(10,4) NOT NULL,
    "sampleSize" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Benchmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CsvUpload" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" "CsvStatus" NOT NULL DEFAULT 'PENDING',
    "parsedData" JSONB,
    "kpiSummary" JSONB,
    "isWinning" BOOLEAN,
    "recommendations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CsvUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScalingLog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "testId" TEXT,
    "scalingType" "ScalingType" NOT NULL,
    "oldBudget" DECIMAL(10,2),
    "newBudget" DECIMAL(10,2),
    "recommendation" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScalingLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usage_userId_key" ON "Usage"("userId");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_productName_idx" ON "Project"("productName");

-- CreateIndex
CREATE INDEX "Project_targetCountry_idx" ON "Project"("targetCountry");

-- CreateIndex
CREATE INDEX "Project_productType_idx" ON "Project"("productType");

-- CreateIndex
CREATE INDEX "Test_projectId_idx" ON "Test"("projectId");

-- CreateIndex
CREATE INDEX "AdCopy_projectId_idx" ON "AdCopy"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Benchmark_niche_country_metricType_key" ON "Benchmark"("niche", "country", "metricType");

-- CreateIndex
CREATE INDEX "CsvUpload_projectId_idx" ON "CsvUpload"("projectId");

-- CreateIndex
CREATE INDEX "ScalingLog_projectId_idx" ON "ScalingLog"("projectId");

-- CreateIndex
CREATE INDEX "ScalingLog_testId_idx" ON "ScalingLog"("testId");

-- AddForeignKey
ALTER TABLE "Usage" ADD CONSTRAINT "Usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdCopy" ADD CONSTRAINT "AdCopy_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CsvUpload" ADD CONSTRAINT "CsvUpload_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScalingLog" ADD CONSTRAINT "ScalingLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScalingLog" ADD CONSTRAINT "ScalingLog_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE SET NULL ON UPDATE CASCADE;
