import { Response , NextFunction} from "express";
import { Request } from 'express-jwt';

import { searchInDb } from "../../db/searchDb.js";

export async function searchGet(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const query = String(req.query.q);
        console.log(query);
        if (!query || query == "") return res.sendStatus(400);

        let quieroUsuario = Boolean(req.query.quieroUsuario);
        let quieroLista = Boolean(req.query.quieroLista);
        let quieroAlbum = Boolean(req.query.quieroAlbum);
        let quieroCancion = Boolean(req.query.quieroCancion);
        let quieroPodcast = Boolean(req.query.quieroPodcast);

        if (!quieroUsuario && !quieroLista && !quieroAlbum && !quieroCancion && !quieroPodcast) {
            quieroUsuario = true;
            quieroLista = true;
            quieroAlbum = true;
            quieroCancion = true;
            quieroPodcast = true;
        }
        const results = await searchInDb(query, quieroUsuario, quieroLista, quieroAlbum, quieroCancion, quieroPodcast);
        return res.status(200).json(results);

    } catch (error) {
        return next(error);
    }
}
