-- DropForeignKey
ALTER TABLE "public"."ItemVenda" DROP CONSTRAINT "ItemVenda_vendaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Venda" DROP CONSTRAINT "Venda_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Venda" DROP CONSTRAINT "Venda_vendedorId_fkey";

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Vendedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVenda" ADD CONSTRAINT "ItemVenda_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE CASCADE ON UPDATE CASCADE;
