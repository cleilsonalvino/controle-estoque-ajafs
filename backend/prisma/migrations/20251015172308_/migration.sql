-- DropForeignKey
ALTER TABLE "public"."Venda" DROP CONSTRAINT "Venda_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Venda" DROP CONSTRAINT "Venda_vendedorId_fkey";

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Vendedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
