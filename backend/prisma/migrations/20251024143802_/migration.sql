/*
  Warnings:

  - You are about to drop the column `lucroEstimado` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `observacoes` on the `Venda` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Venda" DROP COLUMN "lucroEstimado",
DROP COLUMN "observacoes";
