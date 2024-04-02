import e, { Request, Response, NextFunction } from "express";
import path from "path";
import * as etiquetasDbJs from "../../db/etiquetasDb.js";


// PRE: Verdad
// POST: Devuelve todas las etiquetas de canciones y podcasts
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
  
// PRE: Verdad
// POST: Devuelve todas las etiquetas de canciones
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

// PRE: Verdad
// POST: Devuelve todas las etiquetas de podcasts
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


// PRE: Verdad
// POST: Devuelve todas las etiquetas que tiene el Audio con id <id>
export const tagsOfAudio = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const audioEtiquetas: any = await etiquetasDbJs.tagsOfAudio(id);

    res.json(audioEtiquetas); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo etiquetas del audio" });
    throw new Error("Error obteniendo etiquetas del audio");
  }
};

// PRE: Verdad
// POST: Devuelve todas las etiquetas que tiene el Audio con id <id>
export const tagsOfLista = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const audioLista: any = await etiquetasDbJs.tagsOfLista(id);

    res.json(audioLista); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo etiquetas de la lista" });
    throw new Error("Error obteniendo etiquetas de la lista");
  }
};



