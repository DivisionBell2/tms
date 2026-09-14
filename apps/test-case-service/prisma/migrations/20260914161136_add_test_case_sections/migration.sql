-- AlterTable
ALTER TABLE "test_cases" ADD COLUMN     "sectionId" TEXT;

-- CreateTable
CREATE TABLE "test_case_sections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_case_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "test_case_sections_parentId_idx" ON "test_case_sections"("parentId");

-- CreateIndex
CREATE INDEX "test_case_sections_isPinned_idx" ON "test_case_sections"("isPinned");

-- CreateIndex
CREATE INDEX "test_cases_sectionId_idx" ON "test_cases"("sectionId");

-- AddForeignKey
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "test_case_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_case_sections" ADD CONSTRAINT "test_case_sections_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "test_case_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
