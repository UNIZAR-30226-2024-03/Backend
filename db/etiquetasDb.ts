import { Usuario } from "@prisma/client";
import prisma from "../prisma/client.js";

export async function songsTags (): Promise<any> {
  try {
    const allEtiquetasCancion: any = await prisma.etiquetaCancion.findMany();
    return allEtiquetasCancion;
  } catch (error) {
    console.error(error);
    return { message: "Error obteniendo etiquetas de Canciones" };
  }
}

export async function podcastTags (): Promise<any> {
    try {
      const allEtiquetasPodcast: any = await prisma.etiquetaPodcast.findMany();
      return allEtiquetasPodcast;
    } catch (error) {
      console.error(error);
      return { message: "Error obteniendo etiquetas de Podcast" };
    }
  }