/*
  Warnings:

  - Added the required column `email_verification_token` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verification_token" TEXT NOT NULL,
ADD COLUMN     "is_verify" BOOLEAN NOT NULL DEFAULT false;
