/*
  Warnings:

  - You are about to drop the column `localizacao` on the `Fornecedor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Fornecedor" DROP COLUMN "localizacao",
ADD COLUMN     "endereco" TEXT;
