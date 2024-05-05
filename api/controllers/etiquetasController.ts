import path from "path";
import * as etiquetasDbJs from "../../db/etiquetasDb.js";
import e, { Request} from 'express-jwt';
import { Response } from 'express';
import httpStatus from 'http-status';



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
// POST: Devuelve todas las etiquetas que tiene el vector de Audios
export const tagsOfAudios = async (req: Request, res: Response) => {
  try {
    const { idsAudios } = req.body;

    // Verificar si "ids" es un array y no está vacío
    if (!Array.isArray(idsAudios) || idsAudios.length === 0) {
      return res.status(400).json({ message: 'Se requiere un array de IDs de audios en el cuerpo de la solicitud' });
    }

    // Obtener las etiquetas de los audios
    const etiquetasAudios = await Promise.all(idsAudios.map(async (id: number) => {
      const etiquetas = await etiquetasDbJs.tagsOfAudio(id);
      return { idAudio: id, etiquetas };
    }));

    res.json(etiquetasAudios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo etiquetas de los audios' });
  }
};

// Dado en el path el parámetro nAudios
// Devuelve un array con el nombre de las etiquetas de los últimos nAudios escuchados
// por el usuario del jwt
export const tagsNUltimasEscuchas = async (req: Request, res: Response) => {
  try {
    const idUsuario = Number(req.auth?.idUsuario);
    const nAudios = Number(req.params.numEscuchas);
    
    console.log("idUsuario: ", idUsuario);
    console.log("nAudios: ", nAudios);

    if (!nAudios || nAudios <= 0) {
      return res.status(400).json({ message: 'Bad request. numEscuchas must be a positive number' });
    }

    const etiquetas = await etiquetasDbJs.tagsNLastListened(idUsuario, nAudios);

    res.json(etiquetas);
    // res.status(httpStatus.NOT_IMPLEMENTED).json({ message: "Not implemented" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo etiquetas de las últimas escuchas" });
  }
};

// Dados en el path el número de escuchas a tener en cuenta <nAudiosToGetTagsFrom> y el número
// de audios deseado <nAudiosResult>
// Devuelve un array con hasta <nAudiosResult> audio que contengan etiquetas de las últimas <nAudiosToGetTagsFrom> escuchas
// del usuario del jwt
export const getNAudiosByTags = async (req: Request, res: Response) => {
  try {
    const idUsuario = Number(req.auth?.idUsuario);
    const nAudiosToGetTagsFrom = Number(req.params.nAudiosToGetTagsFrom);
    const nAudios = Number(req.params.nAudiosResult);

    // console.log("idUsuario: ", idUsuario);
    // console.log("nAudiosToGetTagsFrom: ", nAudiosToGetTagsFrom);
    // console.log("nAudios: ", nAudios);

    if (!nAudiosToGetTagsFrom || nAudiosToGetTagsFrom <= 0) {
      return res.status(400).json({ message: 'Bad request. numEscuchas must be a positive number' });
    }
    if (!nAudios || nAudios <= 0) {
      return res.status(400).json({ message: 'Bad request. numAudios must be a positive number' });
    }

    const tags = await etiquetasDbJs.tagsNLastListened(idUsuario, nAudiosToGetTagsFrom);
    // console.log(tags);
    const audios = await etiquetasDbJs.getNAudiosByTags(nAudios, tags);

    res.json(audios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo audios por etiquetas" });
  }
}