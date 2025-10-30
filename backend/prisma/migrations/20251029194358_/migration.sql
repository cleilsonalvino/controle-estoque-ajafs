-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "telasPermitidas" TEXT[] DEFAULT ARRAY[]::TEXT[];
