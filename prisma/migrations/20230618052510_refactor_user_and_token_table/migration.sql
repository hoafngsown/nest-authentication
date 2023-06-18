/*
  Warnings:

  - You are about to drop the column `access_token` on the `user_token` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `user_token` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `user_token` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "user_token_access_token_key";

-- AlterTable
ALTER TABLE "user_token" DROP COLUMN "access_token",
DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "refreshToken" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;
