/*
  Warnings:

  - A unique constraint covering the columns `[codigoBarras]` on the table `Produto` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "codigoBarras" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Produto_codigoBarras_key" ON "Produto"("codigoBarras");
