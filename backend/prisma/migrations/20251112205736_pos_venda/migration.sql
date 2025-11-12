-- CreateEnum
CREATE TYPE "StatusPosVenda" AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'FINALIZADO');

-- CreateTable
CREATE TABLE "PosVenda" (
    "id" TEXT NOT NULL,
    "vendaId" TEXT NOT NULL,
    "clienteId" TEXT,
    "empresaId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "dataContato" TIMESTAMP(3),
    "tipoContato" TEXT,
    "status" "StatusPosVenda" NOT NULL DEFAULT 'PENDENTE',
    "satisfacao" INTEGER,
    "observacoes" TEXT,
    "retornoCliente" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PosVenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackCliente" (
    "id" TEXT NOT NULL,
    "posVendaId" TEXT NOT NULL,
    "comentario" TEXT,
    "avaliacao" INTEGER NOT NULL,
    "respondido" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "FeedbackCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "posVendaId" TEXT NOT NULL,
    "dataAgendada" TIMESTAMP(3) NOT NULL,
    "tipoAcao" TEXT,
    "realizado" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PosVenda_vendaId_key" ON "PosVenda"("vendaId");

-- AddForeignKey
ALTER TABLE "PosVenda" ADD CONSTRAINT "PosVenda_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosVenda" ADD CONSTRAINT "PosVenda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosVenda" ADD CONSTRAINT "PosVenda_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosVenda" ADD CONSTRAINT "PosVenda_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackCliente" ADD CONSTRAINT "FeedbackCliente_posVendaId_fkey" FOREIGN KEY ("posVendaId") REFERENCES "PosVenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackCliente" ADD CONSTRAINT "FeedbackCliente_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_posVendaId_fkey" FOREIGN KEY ("posVendaId") REFERENCES "PosVenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
