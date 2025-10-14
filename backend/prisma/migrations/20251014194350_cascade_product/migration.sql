-- DropForeignKey
ALTER TABLE "public"."Movimentacao" DROP CONSTRAINT "Movimentacao_produtoId_fkey";

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
