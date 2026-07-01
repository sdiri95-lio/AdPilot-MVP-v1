-- AlterTable
ALTER TABLE "MediaBuyingTest" ADD COLUMN     "confirmationRate" DECIMAL(5,2) DEFAULT 100,
ADD COLUMN     "deliveryRate" DECIMAL(5,2) DEFAULT 100,
ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "returnFee" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "returnRate" DECIMAL(5,2) DEFAULT 0,
ADD COLUMN     "shippingCost" DECIMAL(10,2) DEFAULT 0;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "importFreightCost" DECIMAL(10,2),
ADD COLUMN     "importReadinessScore" INTEGER,
ADD COLUMN     "supplierLeadTime" INTEGER,
ADD COLUMN     "supplierMoq" INTEGER;

-- CreateTable
CREATE TABLE "CreativeTest" (
    "id" TEXT NOT NULL,
    "mediaBuyingTestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hook" TEXT,
    "spend" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ctr" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "cpc" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cpp" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "roas" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreativeTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTimelineEvent" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectTimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreativeTest_mediaBuyingTestId_idx" ON "CreativeTest"("mediaBuyingTestId");

-- CreateIndex
CREATE INDEX "ProjectTimelineEvent_projectId_idx" ON "ProjectTimelineEvent"("projectId");

-- AddForeignKey
ALTER TABLE "CreativeTest" ADD CONSTRAINT "CreativeTest_mediaBuyingTestId_fkey" FOREIGN KEY ("mediaBuyingTestId") REFERENCES "MediaBuyingTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTimelineEvent" ADD CONSTRAINT "ProjectTimelineEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
