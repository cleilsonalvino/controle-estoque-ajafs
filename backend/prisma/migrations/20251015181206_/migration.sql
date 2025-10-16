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
ALTER TABLE "ItemVenda" ALTER COLUMN "vendaId" SET DEFAULT 'venda_padrao',
ALTER COLUMN "produtoId" SET DEFAULT 'produto_padrao';

-- AlterTable
ALTER TABLE "Movimentacao" ALTER COLUMN "produtoId" SET DEFAULT 'produto_padrao';

-- AlterTable
ALTER TABLE "Produto" ALTER COLUMN "categoriaId" SET DEFAULT 'categoria_padrao',
ALTER COLUMN "fornecedorId" SET DEFAULT 'fornecedor_padrao';

-- AlterTable
ALTER TABLE "Venda" ALTER COLUMN "clienteId" SET DEFAULT 'cliente_padrao',
ALTER COLUMN "status" SET DEFAULT 'Concluída',
ALTER COLUMN "vendedorId" SET DEFAULT 'vendedor_padrao';

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaProduto"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVenda" ADD CONSTRAINT "ItemVenda_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVenda" ADD CONSTRAINT "ItemVenda_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;
