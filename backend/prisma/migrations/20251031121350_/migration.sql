/*
  Warnings:

  - You are about to drop the `MovimentacaoLote` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[empresaId,nome]` on the table `CategoriaProduto` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresaId,nome]` on the table `CategoriaServico` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresaId,cpf]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresaId,email]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresaId,email]` on the table `Fornecedor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresaId,nome]` on the table `Fornecedor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresaId,nome]` on the table `Produto` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresaId,codigoBarras]` on the table `Produto` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresaId,nome]` on the table `Servico` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresaId,email]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresaId,numero]` on the table `Venda` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresaId,email]` on the table `Vendedor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresaId,nome]` on the table `Vendedor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `empresaId` to the `CategoriaProduto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `CategoriaServico` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Fornecedor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `ItemServico` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `ItemVenda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Lote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Movimentacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loteId` to the `Movimentacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Produto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Servico` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Vendedor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."MovimentacaoLote" DROP CONSTRAINT "MovimentacaoLote_loteId_fkey";

-- DropIndex
DROP INDEX "public"."CategoriaProduto_nome_key";

-- DropIndex
DROP INDEX "public"."CategoriaServico_nome_key";

-- DropIndex
DROP INDEX "public"."Cliente_cpf_key";

-- DropIndex
DROP INDEX "public"."Cliente_email_key";

-- DropIndex
DROP INDEX "public"."Fornecedor_email_key";

-- DropIndex
DROP INDEX "public"."Produto_codigoBarras_key";

-- DropIndex
DROP INDEX "public"."Produto_nome_key";

-- DropIndex
DROP INDEX "public"."Servico_nome_key";

-- DropIndex
DROP INDEX "public"."Usuario_email_key";

-- DropIndex
DROP INDEX "public"."Venda_numero_key";

-- DropIndex
DROP INDEX "public"."Vendedor_email_key";

-- AlterTable
ALTER TABLE "CategoriaProduto" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CategoriaServico" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Empresa" ALTER COLUMN "inscEstadual" DROP NOT NULL,
ALTER COLUMN "inscMunicipal" DROP NOT NULL,
ALTER COLUMN "cnae" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Fornecedor" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ItemServico" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ItemVenda" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Lote" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Movimentacao" ADD COLUMN     "empresaId" TEXT NOT NULL,
ADD COLUMN     "loteId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Servico" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Venda" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Vendedor" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."MovimentacaoLote";

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaProduto_empresaId_nome_key" ON "CategoriaProduto"("empresaId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaServico_empresaId_nome_key" ON "CategoriaServico"("empresaId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_empresaId_cpf_key" ON "Cliente"("empresaId", "cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_empresaId_email_key" ON "Cliente"("empresaId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_empresaId_email_key" ON "Fornecedor"("empresaId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_empresaId_nome_key" ON "Fornecedor"("empresaId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "Produto_empresaId_nome_key" ON "Produto"("empresaId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "Produto_empresaId_codigoBarras_key" ON "Produto"("empresaId", "codigoBarras");

-- CreateIndex
CREATE UNIQUE INDEX "Servico_empresaId_nome_key" ON "Servico"("empresaId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_empresaId_email_key" ON "Usuario"("empresaId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Venda_empresaId_numero_key" ON "Venda"("empresaId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "Vendedor_empresaId_email_key" ON "Vendedor"("empresaId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Vendedor_empresaId_nome_key" ON "Vendedor"("empresaId", "nome");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaProduto" ADD CONSTRAINT "CategoriaProduto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fornecedor" ADD CONSTRAINT "Fornecedor_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVenda" ADD CONSTRAINT "ItemVenda_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendedor" ADD CONSTRAINT "Vendedor_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servico" ADD CONSTRAINT "Servico_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaServico" ADD CONSTRAINT "CategoriaServico_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemServico" ADD CONSTRAINT "ItemServico_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
