-- DropForeignKey
ALTER TABLE "public"."Produto" DROP CONSTRAINT "Produto_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Produto" DROP CONSTRAINT "Produto_fornecedorId_fkey";

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaProduto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
