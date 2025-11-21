/*
  Warnings:

  - Made the column `clienteId` on table `OrdemDeServico` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."OrdemDeServico" DROP CONSTRAINT "OrdemDeServico_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrdemDeServico" DROP CONSTRAINT "OrdemDeServico_servicoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrdemDeServico" DROP CONSTRAINT "OrdemDeServico_vendaId_fkey";

-- AlterTable
ALTER TABLE "OrdemDeServico" ADD COLUMN     "identificacaoItem" TEXT,
ADD COLUMN     "problemaRelatado" TEXT,
ALTER COLUMN "servicoId" DROP NOT NULL,
ALTER COLUMN "vendaId" DROP NOT NULL,
ALTER COLUMN "clienteId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "OrdemDeServico" ADD CONSTRAINT "OrdemDeServico_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemDeServico" ADD CONSTRAINT "OrdemDeServico_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemDeServico" ADD CONSTRAINT "OrdemDeServico_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;
