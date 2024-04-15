/**
 * @swagger
 * tags:
 *   name: Listas, Audios, Audio, Busqueda
 *   description: Busqueda de elementos en la base de datos.
 */

import { Router } from "express";
import * as searchCon from "../controllers/searchController.js";
import * as auth from "../middleware/authenticator.js";
import * as searchValidator from "../middleware/validator/searchValidator.js";
import { validate } from "../middleware/validator/index.js";

const router = Router();

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Busca elementos en la base de datos.
 *     tags: [Busqueda]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: Palabra clave a buscar.
 *         schema:
 *           type: string
 *       - in: query
 *         name: quieroUsuario
 *         required: false
 *         description: Buscar usuarios.
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: quieroLista
 *         required: false
 *         description: Buscar listas.
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: quieroAlbum
 *         required: false
 *         description: Buscar album.
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: quieroCancion
 *         required: false
 *         description: Buscar cancion.
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: quieroPodcast
 *         required: false
 *         description: Buscar podcast.
 *         schema:
 *           type: boolean
 *     responses:
 *       "200":
 *         description: Elementos encontrados.
 *       "400":
 *         description: Error en la solicitud.
 *       "401":
 *         description: No autorizado.
 *       "500":
 *         description: Error del servidor.
 */
router.get(
    "/", 
    auth.authenticate,
    validate(searchValidator.searchSchema),
    searchCon.searchGet,
);

export default router;