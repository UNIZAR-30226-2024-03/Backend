import e, { Request, Response, NextFunction } from "express";
import path from "path";
import * as etiquetasDbJs from "../../db/etiquetasDb.js";

export const all = async (req: Request, res: Response) => {
    try {
      const allEtiquetasCancion: any = await etiquetasDbJs.songsTags();
      const allEtiquetasPodcast: any = await etiquetasDbJs.podcastTags();

      const allEtiquetas = [...allEtiquetasCancion, ...allEtiquetasPodcast];
  
      res.json(allEtiquetas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error obteniendo etiquetas" });
      throw new Error("Error obteniendo etiquetas");
    }
  };
  

// Función para obtener etiquetas de canciones
export const songs = async (req: Request, res: Response) => {
  try {
    const cancionEtiquetas: any = await etiquetasDbJs.songsTags();

    res.json(cancionEtiquetas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo etiquetas de canciones" });
    throw new Error("Error obteniendo etiquetas de canciones");
  }
};

// Función para obtener etiquetas de podcasts
export const podcast = async (req: Request, res: Response) => {
  try {
    const podcastEtiquetas: any = await etiquetasDbJs.podcastTags();

    res.json(podcastEtiquetas); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo etiquetas de podcasts" });
    throw new Error("Error obteniendo etiquetas de podcast");
  }
};
