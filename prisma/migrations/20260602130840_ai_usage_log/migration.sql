-- CreateTable
CREATE TABLE "AIUsageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "tokensInput" INTEGER NOT NULL,
    "tokensOutput" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIUsageLog_userId_idx" ON "AIUsageLog"("userId");

-- AddForeignKey
ALTER TABLE "AIUsageLog" ADD CONSTRAINT "AIUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
