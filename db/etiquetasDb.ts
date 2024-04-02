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

// PRE: Verdad
// POST: Devuelve todas las etiquetas que tiene la Lista con id <id>
export async function tagsOfLista(id: number): Promise<any> {
  try {
    const lista = await prisma.lista.findUnique({
      where: {
        idLista: id,
      },
      include: {
        Seguidores: true, // Incluye las relaciones necesarias para acceder a las etiquetas
        Audios: {
          include: {
            EtiquetasCancion: true,
            EtiquetasPodcast: true,
          },
        },
      },
    });

    if (!lista) {
      throw new Error("Lista no encontrada!");
    }

    // Recopilamos todas las etiquetas de los audios de la lista
    const etiquetas: any[] = [];
    lista.Audios.forEach(audio => {
      if (audio.EtiquetasCancion) {
        etiquetas.push(...audio.EtiquetasCancion);
      }
      if (audio.EtiquetasPodcast) {
        etiquetas.push(...audio.EtiquetasPodcast);
      }
    });

    return etiquetas;
  } catch (error) {
    console.error(error);
    throw new Error("Error obteniendo etiquetas de Lista desde Base de Datos");
  }
}