-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "hasReadme" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "qualityScore" INTEGER NOT NULL DEFAULT 0;
