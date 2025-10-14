/*
  Warnings:

  - You are about to drop the column `documento` on the `Fornecedor` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Fornecedor_documento_key";

-- AlterTable
ALTER TABLE "Fornecedor" DROP COLUMN "documento",
ADD COLUMN     "localizacao" TEXT;
