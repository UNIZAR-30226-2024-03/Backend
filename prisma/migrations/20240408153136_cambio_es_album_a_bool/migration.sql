/*
  Warnings:

  - The `esAlbum` column on the `Audio` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Audio" DROP COLUMN "esAlbum",
ADD COLUMN     "esAlbum" BOOLEAN NOT NULL DEFAULT false;
