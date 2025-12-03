/*
  Warnings:

  - You are about to drop the column `nome` on the `Empresa` table. All the data in the column will be lost.
  - You are about to drop the column `nomeFantasia` on the `Empresa` table. All the data in the column will be lost.
  - You are about to drop the column `razaoSocial` on the `Empresa` table. All the data in the column will be lost.
  - Added the required column `nome_fantasia` to the `Empresa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `razao_social` to the `Empresa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Empresa" DROP COLUMN "nome",
DROP COLUMN "nomeFantasia",
DROP COLUMN "razaoSocial",
ADD COLUMN     "nome_fantasia" TEXT NOT NULL,
ADD COLUMN     "razao_social" TEXT NOT NULL;
