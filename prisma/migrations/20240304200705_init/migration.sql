-- CreateEnum
CREATE TYPE "TipoLista" AS ENUM ('MIS_AUDIOS', 'MIS_FAVORITOS', 'MIS_PODCAST', 'NORMAL');

-- CreateTable
CREATE TABLE "Usuario" (
    "idUsuario" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nombreUsuario" TEXT NOT NULL,
    "esAdmin" BOOLEAN NOT NULL DEFAULT false,
    "googleLogin" BOOLEAN NOT NULL DEFAULT false,
    "contrasegna" TEXT,
    "imgPerfil" TEXT,
    "idUltimoAudio" INTEGER,
    "segFinAudio" INTEGER,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("idUsuario")
);

-- CreateTable
CREATE TABLE "Seguir" (
    "seguidorId" INTEGER NOT NULL,
    "seguidoId" INTEGER NOT NULL,

    CONSTRAINT "Seguir_pkey" PRIMARY KEY ("seguidorId","seguidoId")
);

-- CreateTable
CREATE TABLE "SigueLista" (
    "idUsuario" INTEGER NOT NULL,
    "idLista" INTEGER NOT NULL,
    "ultimaEscucha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SigueLista_pkey" PRIMARY KEY ("idUsuario","idLista")
);

-- CreateTable
CREATE TABLE "Lista" (
    "idLista" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "esAlbum" BOOLEAN NOT NULL DEFAULT false,
    "esPrivada" BOOLEAN NOT NULL DEFAULT false,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipoLista" "TipoLista" NOT NULL,
    "imgLista" TEXT,
    "descripcion" TEXT,

    CONSTRAINT "Lista_pkey" PRIMARY KEY ("idLista")
);

-- CreateTable
CREATE TABLE "Audio" (
    "idAudio" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "duracionSeg" INTEGER NOT NULL,
    "fechaLanz" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "esAlbum" TEXT,
    "imgAudio" TEXT,

    CONSTRAINT "Audio_pkey" PRIMARY KEY ("idAudio")
);

-- CreateTable
CREATE TABLE "Escucha" (
    "idUsuario" INTEGER NOT NULL,
    "idAudio" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Escucha_pkey" PRIMARY KEY ("idUsuario","idAudio","fecha")
);

-- CreateTable
CREATE TABLE "EtiquetaPodcast" (
    "idEtiqueta" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "EtiquetaPodcast_pkey" PRIMARY KEY ("idEtiqueta")
);

-- CreateTable
CREATE TABLE "EtiquetaCancion" (
    "idEtiqueta" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "EtiquetaCancion_pkey" PRIMARY KEY ("idEtiqueta")
);

-- CreateTable
CREATE TABLE "_ListaToUsuario" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AudioToUsuario" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AudioToLista" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AudioToEtiquetaPodcast" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AudioToEtiquetaCancion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_ListaToUsuario_AB_unique" ON "_ListaToUsuario"("A", "B");

-- CreateIndex
CREATE INDEX "_ListaToUsuario_B_index" ON "_ListaToUsuario"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AudioToUsuario_AB_unique" ON "_AudioToUsuario"("A", "B");

-- CreateIndex
CREATE INDEX "_AudioToUsuario_B_index" ON "_AudioToUsuario"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AudioToLista_AB_unique" ON "_AudioToLista"("A", "B");

-- CreateIndex
CREATE INDEX "_AudioToLista_B_index" ON "_AudioToLista"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AudioToEtiquetaPodcast_AB_unique" ON "_AudioToEtiquetaPodcast"("A", "B");

-- CreateIndex
CREATE INDEX "_AudioToEtiquetaPodcast_B_index" ON "_AudioToEtiquetaPodcast"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AudioToEtiquetaCancion_AB_unique" ON "_AudioToEtiquetaCancion"("A", "B");

-- CreateIndex
CREATE INDEX "_AudioToEtiquetaCancion_B_index" ON "_AudioToEtiquetaCancion"("B");

-- AddForeignKey
ALTER TABLE "Seguir" ADD CONSTRAINT "Seguir_seguidorId_fkey" FOREIGN KEY ("seguidorId") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seguir" ADD CONSTRAINT "Seguir_seguidoId_fkey" FOREIGN KEY ("seguidoId") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SigueLista" ADD CONSTRAINT "SigueLista_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SigueLista" ADD CONSTRAINT "SigueLista_idLista_fkey" FOREIGN KEY ("idLista") REFERENCES "Lista"("idLista") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Escucha" ADD CONSTRAINT "Escucha_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Escucha" ADD CONSTRAINT "Escucha_idAudio_fkey" FOREIGN KEY ("idAudio") REFERENCES "Audio"("idAudio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListaToUsuario" ADD CONSTRAINT "_ListaToUsuario_A_fkey" FOREIGN KEY ("A") REFERENCES "Lista"("idLista") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListaToUsuario" ADD CONSTRAINT "_ListaToUsuario_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AudioToUsuario" ADD CONSTRAINT "_AudioToUsuario_A_fkey" FOREIGN KEY ("A") REFERENCES "Audio"("idAudio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AudioToUsuario" ADD CONSTRAINT "_AudioToUsuario_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AudioToLista" ADD CONSTRAINT "_AudioToLista_A_fkey" FOREIGN KEY ("A") REFERENCES "Audio"("idAudio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AudioToLista" ADD CONSTRAINT "_AudioToLista_B_fkey" FOREIGN KEY ("B") REFERENCES "Lista"("idLista") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AudioToEtiquetaPodcast" ADD CONSTRAINT "_AudioToEtiquetaPodcast_A_fkey" FOREIGN KEY ("A") REFERENCES "Audio"("idAudio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AudioToEtiquetaPodcast" ADD CONSTRAINT "_AudioToEtiquetaPodcast_B_fkey" FOREIGN KEY ("B") REFERENCES "EtiquetaPodcast"("idEtiqueta") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AudioToEtiquetaCancion" ADD CONSTRAINT "_AudioToEtiquetaCancion_A_fkey" FOREIGN KEY ("A") REFERENCES "Audio"("idAudio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AudioToEtiquetaCancion" ADD CONSTRAINT "_AudioToEtiquetaCancion_B_fkey" FOREIGN KEY ("B") REFERENCES "EtiquetaCancion"("idEtiqueta") ON DELETE CASCADE ON UPDATE CASCADE;
