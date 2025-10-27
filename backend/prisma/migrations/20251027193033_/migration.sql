/*
  Warnings:

  - You are about to drop the `MovimentacaoLote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."MovimentacaoLote" DROP CONSTRAINT "MovimentacaoLote_loteId_fkey";

-- DropTable
DROP TABLE "public"."MovimentacaoLote";
