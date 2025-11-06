/*
  Warnings:

  - Added the required column `codigo` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codigo` to the `Vendedor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "codigo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Vendedor" ADD COLUMN     "codigo" TEXT NOT NULL;
