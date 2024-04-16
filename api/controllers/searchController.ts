import { Response , NextFunction} from "express";
import { Request } from 'express-jwt';

import { searchInDb } from "../../db/searchDb.js";
import { toBoolean } from "../utils/toBoolean.js";

export async function searchGet(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const idUsuario = Number(req.auth?.idUsuario);
        const query = String(req.query.q);
        if (!query || query == "") return res.sendStatus(400);
        let usuario, lista, album, cancion, podcast;
        try {
            usuario = toBoolean(req.query, 'usuario');
            lista = toBoolean(req.query, 'lista');
            album = toBoolean(req.query, 'album');
            cancion = toBoolean(req.query, 'cancion');
            podcast = toBoolean(req.query, 'podcast');
            if (usuario == null && lista == null && album == null && cancion == null && podcast == null) {
                usuario = true; lista = true; album = true; cancion = true; podcast = true;
            }
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
        const results = await searchInDb(query, idUsuario, usuario as boolean, lista as boolean, album as boolean, cancion as boolean, podcast as boolean);
        return res.status(200).json(results);

    } catch (error) {
        return next(error);
    }
}
