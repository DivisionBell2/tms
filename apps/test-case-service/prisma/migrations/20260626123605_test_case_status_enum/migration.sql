/*
  Warnings:

  - The `status` column on the `test_cases` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TestCaseStatus" AS ENUM ('draft', 'manual', 'automated');

-- AlterTable
ALTER TABLE "test_cases" DROP COLUMN "status",
ADD COLUMN     "status" "TestCaseStatus" NOT NULL DEFAULT 'draft';
