/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `ForgotPassword` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ForgotPassword_token_key" ON "ForgotPassword"("token");
