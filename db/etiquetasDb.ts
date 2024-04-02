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