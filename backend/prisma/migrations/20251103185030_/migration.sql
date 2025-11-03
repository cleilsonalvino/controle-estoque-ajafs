/*
  Warnings:

  - You are about to drop the `ItemServico` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ItemServico" DROP CONSTRAINT "ItemServico_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ItemServico" DROP CONSTRAINT "ItemServico_servicoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ItemServico" DROP CONSTRAINT "ItemServico_vendaId_fkey";

-- DropTable
DROP TABLE "public"."ItemServico";

-- CreateTable
CREATE TABLE "tipoServico" (
    "id" TEXT NOT NULL,
    "vendaId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "precoUnitario" DECIMAL(14,2) NOT NULL,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "tipoServico_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tipoServico" ADD CONSTRAINT "tipoServico_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipoServico" ADD CONSTRAINT "tipoServico_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipoServico" ADD CONSTRAINT "tipoServico_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
