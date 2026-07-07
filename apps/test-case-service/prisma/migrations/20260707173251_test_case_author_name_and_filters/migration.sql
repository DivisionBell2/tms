-- AlterTable
ALTER TABLE "test_cases" ADD COLUMN     "authorName" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "test_cases_authorName_idx" ON "test_cases"("authorName");

-- CreateIndex
CREATE INDEX "test_cases_status_idx" ON "test_cases"("status");
