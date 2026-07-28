-- AlterTable
ALTER TABLE "test_cases" ADD COLUMN     "isCritical" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
