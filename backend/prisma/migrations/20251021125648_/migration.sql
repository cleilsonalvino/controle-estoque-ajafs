/*
  Warnings:

  - You are about to drop the column `quantidadeTotal` on the `Lote` table. All the data in the column will be lost.
  - You are about to drop the column `estoqueAtual` on the `Produto` table. All the data in the column will be lost.
  - You are about to drop the column `precoCusto` on the `Produto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lote" DROP COLUMN "quantidadeTotal";

-- AlterTable
ALTER TABLE "Produto" DROP COLUMN "estoqueAtual",
DROP COLUMN "precoCusto";
