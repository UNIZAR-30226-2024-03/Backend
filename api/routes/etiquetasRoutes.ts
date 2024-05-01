/**
 * @swagger
 * tags:
 *   name: Etiquetas
 *   description: Operaciones relacionadas con las etiquetas de audio
 */

import { Router } from "express";
import * as auth from "../middleware/authenticator.js";
import * as etiquetas from "../controllers/etiquetasController.js";
import { validate } from "../middleware/validator/index.js";

const router = Router();

/**
 * @swagger
 * /etiquetas:
 *   get:
 *     summary: Obtiene todas las etiquetas
 *     description: Obtiene todas las etiquetas de audio.
 *     tags: [Etiquetas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Éxito, devuelve toas las etiquetas.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idEtiqueta:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *             example:
 *               - idEtiqueta: 1
 *                 nombre: Deporte
 *               - idEtiqueta: 2
 *                 nombre: Vida
 *               - idEtiqueta: 3
 *                 nombre: Pop
 *               - idEtiqueta: 4
 *                 nombre: Rock

 *       '401':
 *         description: No autorizado, el usuario no tiene permiso para acceder.
 *       '500':
 *         description: Error interno del servidor.
 */
router.get(
  "/",
  auth.authenticate,
  etiquetas.all,
);

/**
 * @swagger
 * /etiquetas/cancion:
 *   get:
 *     summary: Obtiene las etiquetas de canción
 *     description: Obtiene todas las etiquetas relacionadas con canción.
 *     tags: [Etiquetas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Éxito, devuelve las etiquetas de los canción.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idEtiqueta:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *             example:
 *               - idEtiqueta: 1
 *                 nombre: Pop
 *               - idEtiqueta: 2
 *                 nombre: Rock
 *       '401':
 *         description: No autorizado, el usuario no tiene permiso para acceder.
 *       '500':
 *         description: Error interno del servidor.
 */

router.get(
    "/cancion/",
    auth.authenticate,
    etiquetas.songs,
);

/**
 * @swagger
 * /etiquetas/podcast:
 *   get:
 *     summary: Obtiene las etiquetas de podcasts
 *     description: Obtiene todas las etiquetas relacionadas con podcasts.
 *     tags: [Etiquetas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Éxito, devuelve las etiquetas de los podcast.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idEtiqueta:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *             example:
 *               - idEtiqueta: 1
 *                 nombre: Deporte
 *               - idEtiqueta: 2
 *                 nombre: Vida
 *       '401':
 *         description: No autorizado, el usuario no tiene permiso para acceder.
 *       '500':
 *         description: Error interno del servidor.
 */

router.get(
    "/podcast/",
    auth.authenticate,
    etiquetas.podcast,
);

/**
 * @swagger
 * /etiquetas/audios:
 *   post:
 *     summary: Obtiene las etiquetas de un conjunto de audios
 *     description: Obtiene las etiquetas de un conjunto de audios dada una lista de IDs.
 *     tags: [Etiquetas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idsAudios:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["id_audio_1", "id_audio_2"]
 *     responses:
 *       '200':
 *         description: Éxito, devuelve las etiquetas de los audios proporcionados.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idAudio:
 *                     type: string
 *                   etiquetas:
 *                     type: array
 *                     items:
 *                       type: string
 *       '400':
 *         description: Solicitud incorrecta, la lista de IDs de audio no es válida.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Se requiere un array de IDs de audios en el cuerpo de la solicitud con el nombre idsAudios."
 *       '401':
 *         description: No autorizado, el usuario no tiene permiso para acceder.
 *       '500':
 *         description: Error interno del servidor.
 */

router.post(
  "/audios/", 
  auth.authenticate,
  etiquetas.tagsOfAudios,
);



/**
 * @swagger
 * /etiquetas/infinite/{nAudiosToGetTagsFrom}/{nAudiosResult}:
 *   get:
 *     summary: Obtiene las etiquetas de las últimas n audios escuchados
 *     description: Obtiene las etiquetas de las últimas n audios escuchados por el usuario.
 *     tags: [Etiquetas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nAudiosToGetTagsFrom
 *         required: true
 *         description: Número de audios de los que se obtendrán las etiquetas.
 *         schema:
 *           type: integer
 *       - in: path
 *         name: nAudiosResult
 *         required: true
 *         description: Número de audios que se devolverán.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Éxito, devuelve las etiquetas de los últimos n audios escuchados.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Audio'
 *       '401':
 *         description: No autorizado, el usuario no tiene permiso para acceder.
 *       '500':
 *         description: Error interno del servidor.
 */
router.get("/infinite/:nAudiosToGetTagsFrom/:nAudiosResult", auth.authenticate, validate, etiquetas.getNAudiosByTags);


router.get("/tagsNLastListened/:numEscuchas", auth.authenticate, validate, etiquetas.tagsNUltimasEscuchas);
export default router;
