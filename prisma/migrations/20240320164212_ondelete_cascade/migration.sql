-- DropForeignKey
ALTER TABLE "Escucha" DROP CONSTRAINT "Escucha_idAudio_fkey";

-- DropForeignKey
ALTER TABLE "Escucha" DROP CONSTRAINT "Escucha_idUsuario_fkey";

-- DropForeignKey
ALTER TABLE "Seguir" DROP CONSTRAINT "Seguir_seguidoId_fkey";

-- DropForeignKey
ALTER TABLE "Seguir" DROP CONSTRAINT "Seguir_seguidorId_fkey";

-- DropForeignKey
ALTER TABLE "SigueLista" DROP CONSTRAINT "SigueLista_idLista_fkey";

-- DropForeignKey
ALTER TABLE "SigueLista" DROP CONSTRAINT "SigueLista_idUsuario_fkey";

-- AddForeignKey
ALTER TABLE "Seguir" ADD CONSTRAINT "Seguir_seguidorId_fkey" FOREIGN KEY ("seguidorId") REFERENCES "Usuario"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seguir" ADD CONSTRAINT "Seguir_seguidoId_fkey" FOREIGN KEY ("seguidoId") REFERENCES "Usuario"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SigueLista" ADD CONSTRAINT "SigueLista_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SigueLista" ADD CONSTRAINT "SigueLista_idLista_fkey" FOREIGN KEY ("idLista") REFERENCES "Lista"("idLista") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Escucha" ADD CONSTRAINT "Escucha_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Escucha" ADD CONSTRAINT "Escucha_idAudio_fkey" FOREIGN KEY ("idAudio") REFERENCES "Audio"("idAudio") ON DELETE CASCADE ON UPDATE CASCADE;
