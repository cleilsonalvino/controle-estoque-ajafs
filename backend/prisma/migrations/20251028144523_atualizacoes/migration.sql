/*
  Warnings:

  - Added the required column `atualizadoEm` to the `CategoriaProduto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `atualizadoEm` to the `CategoriaServico` table without a default value. This is not possible if the table is not empty.
  - Added the required column `atualizadoEm` to the `Empresa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `atualizadoEm` to the `Lote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `atualizadoEm` to the `Venda` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CategoriaProduto" ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "CategoriaServico" ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Lote" ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Venda" ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL;
