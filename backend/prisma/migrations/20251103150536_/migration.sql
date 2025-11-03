/*
  Warnings:

  - The values [EMPRESA] on the enum `Papel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Papel_new" AS ENUM ('ADMINISTRADOR', 'USUARIO', 'SUPER_ADMIN');
ALTER TABLE "public"."Usuario" ALTER COLUMN "papel" DROP DEFAULT;
ALTER TABLE "Usuario" ALTER COLUMN "papel" TYPE "Papel_new" USING ("papel"::text::"Papel_new");
ALTER TYPE "Papel" RENAME TO "Papel_old";
ALTER TYPE "Papel_new" RENAME TO "Papel";
DROP TYPE "public"."Papel_old";
ALTER TABLE "Usuario" ALTER COLUMN "papel" SET DEFAULT 'USUARIO';
COMMIT;
