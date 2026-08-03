-- CreateEnum
CREATE TYPE "TestCaseTaskStatus" AS ENUM ('open', 'done');

-- CreateTable
CREATE TABLE "test_case_steps" (
    "id" TEXT NOT NULL,
    "testCaseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "expectedResult" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "test_case_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_case_tasks" (
    "id" TEXT NOT NULL,
    "testCaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "TestCaseTaskStatus" NOT NULL DEFAULT 'open',

    CONSTRAINT "test_case_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "test_case_steps_testCaseId_idx" ON "test_case_steps"("testCaseId");

-- CreateIndex
CREATE INDEX "test_case_tasks_testCaseId_idx" ON "test_case_tasks"("testCaseId");

-- CreateIndex
CREATE INDEX "test_cases_isCritical_idx" ON "test_cases"("isCritical");

-- AddForeignKey
ALTER TABLE "test_case_steps" ADD CONSTRAINT "test_case_steps_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "test_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_case_tasks" ADD CONSTRAINT "test_case_tasks_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "test_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
