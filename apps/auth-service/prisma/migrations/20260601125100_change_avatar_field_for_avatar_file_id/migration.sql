/*
  Warnings:

  - You are about to drop the column `avatarField` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarField",
ADD COLUMN     "avatarFileId" TEXT;
