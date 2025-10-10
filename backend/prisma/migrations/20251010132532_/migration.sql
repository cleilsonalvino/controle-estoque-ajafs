/*
  Warnings:

  - The values [GERENTE,VISUALIZADOR] on the enum `Papel` will be removed. If these variants are still used in the database, this will fail.
  - The values [TRANSFERENCIA,RESERVA,LIBERACAO,CONSUMO] on the enum `TipoMovimentacao` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `custoNaVenda` on the `ItemVenda` table. All the data in the column will be lost.
  - You are about to alter the column `precoUnitario` on the `ItemVenda` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,4)` to `Decimal(14,2)`.
  - You are about to drop the column `custoUnitario` on the `Movimentacao` table. All the data in the column will be lost.
  - You are about to drop the column `depositoId` on the `Movimentacao` table. All the data in the column will be lost.
  - You are about to drop the column `fornecedorId` on the `Movimentacao` table. All the data in the column will be lost.
  - You are about to drop the column `loteId` on the `Movimentacao` table. All the data in the column will be lost.
  - You are about to drop the column `meta` on the `Movimentacao` table. All the data in the column will be lost.
  - You are about to drop the column `referencia` on the `Movimentacao` table. All the data in the column will be lost.
  - You are about to drop the column `custoMedio` on the `Produto` table. All the data in the column will be lost.
  - You are about to drop the column `diasValidade` on the `Produto` table. All the data in the column will be lost.
  - You are about to drop the column `estoqueMinimo` on the `Produto` table. All the data in the column will be lost.
  - You are about to drop the column `rastrearPorLote` on the `Produto` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `Produto` table. All the data in the column will be lost.
  - You are about to drop the column `unidadeMedida` on the `Produto` table. All the data in the column will be lost.
  - You are about to drop the column `nomeCliente` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the `Deposito` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Fornecedor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LancamentoFinanceiro` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PosicaoEstoque` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProdutoFornecedor` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `preco` to the `Produto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Papel_new" AS ENUM ('ADMINISTRADOR', 'USUARIO');
ALTER TABLE "public"."Usuario" ALTER COLUMN "papel" DROP DEFAULT;
ALTER TABLE "Usuario" ALTER COLUMN "papel" TYPE "Papel_new" USING ("papel"::text::"Papel_new");
ALTER TYPE "Papel" RENAME TO "Papel_old";
ALTER TYPE "Papel_new" RENAME TO "Papel";
DROP TYPE "public"."Papel_old";
ALTER TABLE "Usuario" ALTER COLUMN "papel" SET DEFAULT 'USUARIO';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TipoMovimentacao_new" AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE');
ALTER TABLE "Movimentacao" ALTER COLUMN "tipo" TYPE "TipoMovimentacao_new" USING ("tipo"::text::"TipoMovimentacao_new");
ALTER TYPE "TipoMovimentacao" RENAME TO "TipoMovimentacao_old";
ALTER TYPE "TipoMovimentacao_new" RENAME TO "TipoMovimentacao";
DROP TYPE "public"."TipoMovimentacao_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Lote" DROP CONSTRAINT "Lote_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Movimentacao" DROP CONSTRAINT "Movimentacao_depositoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Movimentacao" DROP CONSTRAINT "Movimentacao_fornecedorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Movimentacao" DROP CONSTRAINT "Movimentacao_loteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PosicaoEstoque" DROP CONSTRAINT "PosicaoEstoque_depositoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PosicaoEstoque" DROP CONSTRAINT "PosicaoEstoque_loteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PosicaoEstoque" DROP CONSTRAINT "PosicaoEstoque_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProdutoFornecedor" DROP CONSTRAINT "ProdutoFornecedor_fornecedorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProdutoFornecedor" DROP CONSTRAINT "ProdutoFornecedor_produtoId_fkey";

-- DropIndex
DROP INDEX "public"."Produto_sku_key";

-- AlterTable
ALTER TABLE "ItemVenda" DROP COLUMN "custoNaVenda",
ALTER COLUMN "precoUnitario" SET DATA TYPE DECIMAL(14,2);

-- AlterTable
ALTER TABLE "Movimentacao" DROP COLUMN "custoUnitario",
DROP COLUMN "depositoId",
DROP COLUMN "fornecedorId",
DROP COLUMN "loteId",
DROP COLUMN "meta",
DROP COLUMN "referencia",
ADD COLUMN     "observacao" TEXT;

-- AlterTable
ALTER TABLE "Produto" DROP COLUMN "custoMedio",
DROP COLUMN "diasValidade",
DROP COLUMN "estoqueMinimo",
DROP COLUMN "rastrearPorLote",
DROP COLUMN "sku",
DROP COLUMN "unidadeMedida",
ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "estoqueAtual" DECIMAL(14,3) NOT NULL DEFAULT 0,
ADD COLUMN     "preco" DECIMAL(14,2) NOT NULL;

-- AlterTable
ALTER TABLE "Venda" DROP COLUMN "nomeCliente",
ADD COLUMN     "cliente" TEXT;

-- DropTable
DROP TABLE "public"."Deposito";

-- DropTable
DROP TABLE "public"."Fornecedor";

-- DropTable
DROP TABLE "public"."LancamentoFinanceiro";

-- DropTable
DROP TABLE "public"."Lote";

-- DropTable
DROP TABLE "public"."PosicaoEstoque";

-- DropTable
DROP TABLE "public"."ProdutoFornecedor";

-- DropEnum
DROP TYPE "public"."TipoFinanceiro";
