/*
  Warnings:

  - You are about to drop the column `enderecoId` on the `Empresa` table. All the data in the column will be lost.
  - You are about to drop the `Endereco` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `bairro` to the `Empresa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cep` to the `Empresa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cidade` to the `Empresa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endereco` to the `Empresa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado` to the `Empresa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero` to the `Empresa` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Empresa" DROP CONSTRAINT "Empresa_enderecoId_fkey";

-- AlterTable
ALTER TABLE "Empresa" DROP COLUMN "enderecoId",
ADD COLUMN     "bairro" TEXT NOT NULL,
ADD COLUMN     "cep" TEXT NOT NULL,
ADD COLUMN     "cidade" TEXT NOT NULL,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "endereco" TEXT NOT NULL,
ADD COLUMN     "estado" TEXT NOT NULL,
ADD COLUMN     "numero" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Endereco";
