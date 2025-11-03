/*
  Warnings:

  - A unique constraint covering the columns `[empresaId,nome]` on the table `Marca` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `empresaId` to the `Marca` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Marca" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Marca_empresaId_nome_key" ON "Marca"("empresaId", "nome");

-- AddForeignKey
ALTER TABLE "Marca" ADD CONSTRAINT "Marca_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
