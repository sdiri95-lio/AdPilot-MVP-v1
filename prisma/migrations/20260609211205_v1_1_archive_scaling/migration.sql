-- AlterTable
ALTER TABLE "MediaBuyingTest" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;
