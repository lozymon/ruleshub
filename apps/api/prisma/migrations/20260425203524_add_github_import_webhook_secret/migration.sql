/*
  Warnings:

  - You are about to drop the column `webhookId` on the `GitHubImport` table. All the data in the column will be lost.
  - Added the required column `webhookSecret` to the `GitHubImport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GitHubImport" DROP COLUMN "webhookId",
ADD COLUMN     "webhookSecret" TEXT NOT NULL;
