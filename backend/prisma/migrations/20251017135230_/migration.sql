/*
  Warnings:

  - You are about to drop the column `preco` on the `Produto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Produto" DROP COLUMN "preco",
ADD COLUMN     "precoCusto" DECIMAL(14,2) NOT NULL DEFAULT 0,
ADD COLUMN     "precoVenda" DECIMAL(14,2) NOT NULL DEFAULT 0;
