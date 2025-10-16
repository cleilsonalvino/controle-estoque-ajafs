-- DropForeignKey
ALTER TABLE "public"."ItemVenda" DROP CONSTRAINT "ItemVenda_produtoId_fkey";

-- AddForeignKey
ALTER TABLE "ItemVenda" ADD CONSTRAINT "ItemVenda_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
