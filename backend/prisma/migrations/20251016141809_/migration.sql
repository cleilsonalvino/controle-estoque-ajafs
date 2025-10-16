-- DropForeignKey
ALTER TABLE "public"."ItemVenda" DROP CONSTRAINT "ItemVenda_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ItemVenda" DROP CONSTRAINT "ItemVenda_vendaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Movimentacao" DROP CONSTRAINT "Movimentacao_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Produto" DROP CONSTRAINT "Produto_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Produto" DROP CONSTRAINT "Produto_fornecedorId_fkey";

-- AlterTable
ALTER TABLE "ItemVenda" ALTER COLUMN "vendaId" DROP DEFAULT,
ALTER COLUMN "produtoId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Movimentacao" ALTER COLUMN "produtoId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Produto" ALTER COLUMN "categoriaId" DROP DEFAULT,
ALTER COLUMN "fornecedorId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Venda" ALTER COLUMN "clienteId" DROP DEFAULT,
ALTER COLUMN "vendedorId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaProduto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVenda" ADD CONSTRAINT "ItemVenda_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVenda" ADD CONSTRAINT "ItemVenda_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
