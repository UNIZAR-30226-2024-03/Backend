/**
 * @swagger
 * tags:
 *   name: Audio
 *   description: Operaciones relacionadas con los audios
 */


const projectRootPath = process.cwd(); // Devuelve el directorio raíz del proyecto y se almacena en una constante

import { Router , Request, NextFunction} from "express";
import * as auth from "../middleware/authenticator.js";
import multer from "multer";
import * as audioController from '../controllers/audioController.js';
import path from 'path';
import crypto from 'crypto';


const router = Router();
//Configuración de multer
const opciones = multer.diskStorage({ //Opciones para subir archivos
    destination: function(req: Request, file: Express.Multer.File, cb: any) { 
        cb(null, path.join(projectRootPath,'tmp')); //Se almacenan en la carpeta audios desde la raiz del proyecto
    },
    filename: function(req: Request, file: Express.Multer.File, cb: any) { 
        const now = Date.now().toString(); // Salt
        const hash = crypto.createHash('sha1').update(file.originalname + now).digest('hex'); // Hash
        const extension = path.extname(file.originalname);
        cb(null, `${hash}${extension}`); 
    }
});
const upload = multer(
    {storage: opciones,
    fileFilter: function (req, file, cb) { //Filtro para aceptar solo archivos de audio
        if (file.mimetype !== 'audio/mpeg' && file.mimetype !== 'audio/wav' && file.mimetype !== 'audio/mp4') { //Si el archivo no es de tipo mp3(mpeg es mp3), wav o mp4
            return cb(null, false); // No se acepta el archivo, se devuelve el callback con false
        }
        cb(null, true); // Se acepta el archivo y se devuelve el callback con true
    }
});



/**
 * @swagger
 *  /audio/{idaudio}:
 *  get:
 *    summary: Obtiene información del audio indicado en la URL
 *    tags: [Audio]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: idaudio
 *        required: true
 *        description: Identificador del audio
 *        schema:
 *          type: integer
 *    responses:
 *      200:
 *        description: Información del audio
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                idaudio:
 *                  type: integer
 *                titulo:
 *                  type: string
 *                path:
 *                  type: string
 *                duracionSeg:
 *                  type: integer
 *                fechaLanz:
 *                  type: string
 *                esAlbum:
 *                  type: boolean
 *                imgAudio:
 *                  type: string
 *                esPrivada:
 *                  type: boolean
 *                artistas:
 *                  type: array
 *                  items:
 *                    type: integer
 *                vecesEscuchada:
 *                 type: integer
 *      400:
 *        description: No se ha recibido el id del audio
 *      403:
 *        description: No se tiene permiso para acceder a este recurso
 *      404:
 *        description: No se ha encontrado el audio con el id indicado
 *      500:
 *        description: Error interno del servidor
 */
router.get('/:idaudio',auth.authenticate,audioController.verifyAudio,audioController.getAudio);

/**
 * @swagger
 *  /audio/play/{idaudio}:
 *  get:
 *    summary: Reproduce el audio indicado en la URL
 *    tags: [Audio]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: idaudio
 *        required: true
 *        description: Identificador del audio
 *        schema:
 *          type: integer
 *    responses:
 *      200:
 *        description: Reproduciendo audio
 *      400:
 *        description: No se ha recibido el id del audio
 *      403:
 *        description: No se tiene permiso para acceder a este recurso
 *      404:
 *        description: No se ha encontrado el audio con el id indicado
 *      500:
 *        description: Error interno del servidor
 */
router.get('/play/:idaudio', auth.authenticate,audioController.verifyAudio, audioController.playAudio);


/**
 * @swagger
 *  /audio/upload:
 *  post:
 *    summary: Crea un nuevo audio
 *    tags: [Audio]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              cancion:
 *                type: string
 *                format: binary
 *              titulo:
 *                type: string
 *              duracionSeg:
 *                type: integer
 *              fechaLanz:
 *                type: string
 *                format: date-time
 *                description: "Formato de fecha: YYYY-MM-DDTHH:mm:ss.sssZ"
 *              esAlbum:
 *                type: boolean
 *              esPrivada:
 *                type: boolean
 *              esPodcast:
 *               type: boolean
 *              imgAudio (opcional):
 *                type: string
 *              idsUsuarios (opcional):
 *                type: string
 *                description: Lista de ids de usuario separados por comas
 *              etiquetas (opcional):
 *                 type: string
 *                 description: Lista de ids de etiquetas separadas por comas
 *              tipoEtiqueta (opcional):
 *                  type: string
 *                  description: Tipo de etiqueta a añadir, debe de ser 'Podcast' o 'Cancion'
 * 
 *    responses:
 *      200:
 *       description: Audio creado correctamente
 *       content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                 type: string
 *                idaudio:
 *                  type: integer
 *      400:
 *        description: Error con formato de la petición
 *      403:
 *        description: No se tiene permiso para acceder a este recurso
 *      500:
 *        description: Error interno del servidor
 */
router.post('/upload',auth.authenticate,audioController.deleteTmpFiles,upload.single('cancion'), audioController.verifyUsersList, audioController.createAudio);



/**
 * @swagger
 * /audio/delete/{idaudio}:
 *  delete:
 *    summary: Elimina el audio indicado en la URL
 *    tags: [Audio]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: idaudio
 *        required: true
 *        description: Identificador del audio
 *        schema:
 *          type: integer
 *    responses:
 *      200:
 *        description: Audio eliminado correctamente
 *      400:
 *        description: No se ha recibido el id del audio
 *      403:
 *        description: No se tiene permiso para acceder a este recurso
 *      404:
 *        description: No se ha encontrado el audio con el id indicado
 *      500:
 *        description: Error interno del servidor
 */
router.delete('/delete/:idaudio', auth.authenticate,audioController.verifyAudio,audioController.deleteAudio);

/**
 * @swagger
 *  /audio/update/{idaudio}:
 *  put:
 *    summary: Actualiza un audio existente
 *    tags: [Audio]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              cancion (opcional):
 *                type: string
 *                format: binary
 *              titulo (opcional):
 *                type: string
 *              duracionSeg (opcional):
 *                type: integer
 *              fechaLanz (opcional):
 *                type: string
 *                format: date-time
 *                description: "Formato de fecha: YYYY-MM-DDTHH:mm:ss.sssZ"
 *              esAlbum (opcional):
 *                type: boolean
 *              esPrivada (opcional):
 *                type: boolean
 *              imgAudio (opcional):
 *                type: string
 *              idsUsuarios (opcional):
 *                type: string
 *                description: Lista de ids de usuario separados por comas
 *              etiquetas (opcional):
 *                 type: string
 *                 description: Lista de ids de etiquetas separadas por comas
 *              tipoEtiqueta (opcional):
 *                  type: string
 *                  description: Tipo de etiqueta a añadir, debe de ser 'Podcast' o 'Cancion'
 *              eliminarEtiquetas (opcional):
 *                  type: boolean
 *                  description: Indica si se deben eliminar las etiquetas del audio en vez de añadirlas
 * 
 *    responses:
 *      200:
 *       description: Audio creado correctamente
 *      400:
 *        description: Error con formato de la petición
 *      403:
 *        description: No se tiene permiso para acceder a este recurso
 *      500:
 *        description: Error interno del servidor
 */
router.put('/update/:idaudio', auth.authenticate,audioController.deleteTmpFiles,upload.single('cancion'),audioController.verifyAudio,audioController.verifyUsersList,audioController.updateAudio);


export default router;