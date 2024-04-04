/*
  Warnings:

  - You are about to drop the column `fecha` on the `Lista` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lista" DROP COLUMN "fecha",
ADD COLUMN     "fechaUltimaMod" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
