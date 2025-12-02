/*
  Warnings:

  - You are about to drop the column `descricao` on the `ContaBancaria` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ContaBancaria" DROP COLUMN "descricao",
ADD COLUMN     "observacoes" TEXT;
