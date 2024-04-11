import { Usuario } from "@prisma/client";
import prisma from "../prisma/client.js";

// PRE: Verdad
// POST: Devuelve todas las etiquetas de canciones
export async function songsTags (): Promise<any> {
  try {
    const allEtiquetasCancion: any = await prisma.etiquetaCancion.findMany();
    return allEtiquetasCancion;
  } catch (error) {
    console.error(error);
    throw new Error("Error obteniendo etiquetas de Canciones desde Base de Datos");
  }
}

// PRE: Verdad
// POST: Devuelve todas las etiquetas de podcast
export async function podcastTags (): Promise<any> {
    try {
      const allEtiquetasPodcast: any = await prisma.etiquetaPodcast.findMany();
      return allEtiquetasPodcast;
    } catch (error) {
      console.error(error);
      throw new Error("Error obteniendo etiquetas de Podcast desde Base de Datos");
    }
}
// PRE: Verdad
// POST: Devuelve todas las etiquetas que tiene el Audio con id <id>
export async function tagsOfAudio (id: number): Promise<any> {
  try {
    const audio = await prisma.audio.findUnique({
      where: {
        idAudio: id,
      },
      include: {
        EtiquetasCancion: true,
        EtiquetasPodcast: true,
      },
    });

    if (!audio) {
      throw new Error("Audio no encontrado!");
    }

    // Filtramos las etiquetas que no sean null
    const etiquetas = audio.EtiquetasCancion ? audio.EtiquetasCancion : audio.EtiquetasPodcast;

    return etiquetas;
  } catch (error) {
    console.error(error);
    throw new Error("Error obteniendo etiquetas de Audio desde Base de Datos");
  }
}


export async function addTagToAudio(idAudio: number, idLabel: number, tipoEtiqueta: string) {

  if (tipoEtiqueta === "Podcast") {
    await prisma.etiquetaCancion.update({
      where: { idEtiqueta: idLabel },
      data: {
        Audios: {
          connect: { idAudio: idAudio },
        },
      },
    });
  } else if (tipoEtiqueta === "Cancion") {
    await prisma.etiquetaPodcast.update({
      where: { idEtiqueta: idLabel },
      data: {
        Audios: {
          connect: { idAudio: idAudio },
        },
      },
    });
  }
}

export async function createTagSong (name: string): Promise<string> {
  try {
    const tag = await prisma.etiquetaCancion.create({
      data: {
        nombre: name,
      },
    });

    return tag.nombre;
  } catch (error) { 
    console.error(error);
    throw new Error("Error creando etiqueta de Canción en Base de Datos");
  }
}

export async function createTagPodcast (name: string): Promise<string> {
  try {
    const tag = await prisma.etiquetaPodcast.create({
      data: {
        nombre: name,
      },
    });

    return tag.nombre;
  } catch (error) { 
    console.error(error);
    throw new Error("Error creando etiqueta de Podcast en Base de Datos");
  }
}