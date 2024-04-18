/**
 * @swagger
 * tags:
 *   name: Usuario
 *   description: Operaciones relacionadas con los usuarios de la aplicación
 * components:
 *  schemas:
 *      Usuario:
 *          type: object
 *          required:
 *             - idUsuario
 *             - nombreUsuario
 *             - esAdmin
 *             - contrasegna
 *             - imgPerfil
 *             - idUltimoAudio
 *             - segFinAudio 
 *          properties:
 *              idUsuario:
 *                 type: number
 *                 description: Identificador del usuario.
 *              nombreUsuario:
 *                 type: string
 *                 description: Nombre de usuario.
 *              esAdmin:
 *                 type: boolean
 *                 description: Indica si el usuario es administrador.
 *              contrasegna:
 *                 type: string
 *                 description: Contraseña del usuario.
 *              imgPerfil:
 *                 type: string
 *                 description: Imagen de perfil del usuario.
 *              idUltimoAudio:
 *                 type: number
 *                 description: Id del último audio escuchado por el usuario.
 *              segFinAudio:
 *                 type: number
 *                 description: Segundos escuchados del último audio.
 *      UsuarioReduced:
 *          type: object
 *          required:
 *             - idUsuario
 *             - nombreUsuario
 *             - esAdmin
 *             - contrasegna
 *             - imgPerfil
 *             - idUltimoAudio
 *             - segFinAudio 
 *          properties:
 *              contrasegna:
 *                 type: string
 *                 description: Contraseña del usuario.
 *              imgPerfil:
 *                 type: string
 *                 description: Imagen de perfil del usuario.
 *              idUltimoAudio:
 *                 type: number
 *                 description: Id del último audio escuchado por el usuario.
 *              segFinAudio:
 *                 type: number
 *                 description: Segundos escuchados del último audio.
 *      ReducedAudio:
 *          type: object
 *          properties:
 *              idAudio:
 *                  type: boolean
 *              titulo:
 *                  type: boolean
 *              duracionSeg:
 *                  type: boolean
 *              esAlbum:
 *                  type: boolean
 *              imgAudio:
 *                  type: boolean
 *              Artistas:
 *                  type: object
 *                  properties:
 *                      idUsuario:
 *                          type: boolean
 *                      nombreUsuario:
 *                          type: boolean
 */
import { Router } from "express";

import * as auth from "../middleware/authenticator.js";
import { validate } from "../middleware/validator/index.js";
import * as usuarioValidatorJs from "../middleware/validator/usuarioValidator.js";
import * as usuarioCon from "../controllers/usuarioController.js";

const router = Router();

/**
 * @swagger
 * /usuario:
 *  get:
 *    summary: Obtiene la información de un usuario
 *    security:
 *      - bearerAuth: []
 *    tags: [Usuario]
 *    parameters:
 *       - in: query
 *         name: idUsuario
 *         required: false
 *         description: Busca al usuario por su id.
 *         schema:
 *           type: string
 *       - in: query
 *         name: rrss
 *         required: false
 *         description: True si se quiere obtener los seguidores y seguidos del usuario.
 *         schema:
 *           type: boolean
 *    responses:
 *      200:
 *        description: Éxito, devuelve la información del usuario
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Usuario'
 *      400:
 *        description: Error en la petición.
 *      401:
 *        description: No autorizado, el usuario no tiene permiso para acceder.
 *      404:
 *        description: No se ha encontrado el usuario.
 *      500:
 *        description: Error interno del servidor.
 */
router.get(
  "/",
  auth.optionalAuthenticate,
  validate(usuarioValidatorJs.usuarioGetSchema),
  usuarioCon.usuarioGet,
);

/**
 * @swagger
 * /usuario/audios:
 *  get:
 *    summary: Obtiene los audios de un usuario
 *    description: Obtiene los audios de un usuario, si el usuario no está autenticado solo se devuelven los audios públicos.
 *    security:
 *      - bearerAuth: []
 *    tags: [Usuario]
 *    parameters:
 *       - in: query
 *         name: idUsuario
 *         required: false
 *         description: Busca al usuario por su id.
 *         schema:
 *           type: string
 *       - in: query
 *         name: canciones
 *         required: false
 *         description: False si no se quieren obtener las canciones del usuario.
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: podcasts
 *         required: false
 *         description: False si no se quieren obtener los podcasts del usuario.
 *         schema:
 *           type: boolean
 *    responses:
 *      200:
 *        description: Éxito, devuelve los audios del usuario
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/ReducedAudio'
 *      400:
 *        description: Error en la petición.
 *      401:
 *        description: No autorizado, el usuario no tiene permiso para acceder.
 *      500:
 *        description: Error interno del servidor.
 */
router.get(
  "/audios",
  auth.optionalAuthenticate,
  validate(usuarioValidatorJs.usuarioGetAudiosSchema),
  usuarioCon.usuarioGetAudios,
);

/**
 * @swagger
 * /usuario:
 *  put:
 *    summary: Modifica la información de un usuario
 *    security:
 *      - bearerAuth: []
 *    tags: [Usuario]
 *    parameters:
 *      - in: body
 *        schema:
 *          $ref: '#/components/schemas/Usuario'
 *    responses:
 *      201:
 *        description: Éxito, devuelve la información del usuario
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UsuarioReduced'
 *      400:
 *        description: Error en la petición.
 *      401:
 *        description: No autorizado, el usuario no tiene permiso para acceder.
 *      404:
 *        description: No se ha encontrado el usuario.
 *      500:
 *        description: Error interno del servidor.
 */
router.put(
  "/",
  auth.authenticate,
  validate(usuarioValidatorJs.usuarioModifySchema),
  usuarioCon.usuarioModify,
);

/**
 * @swagger
 * /usuario/follow/:seguido:
 *  put:
 *    summary: El usuario autenticado sigue a otro usuario
 *    security:
 *      - bearerAuth: []
 *    tags: [Usuario]
 *    parameters:
 *       - in: params
 *         name: seguido
 *         description: Id del usuario a seguir
 *         schema:
 *           type: string
 *    responses:
 *      200:
 *        description: Éxito, el usuario autenticado sigue al usuario especificado
 *      400:
 *        description: Error en la petición.
 *      401:
 *        description: No autorizado, el usuario no tiene permiso para acceder.
 *      404:
 *        description: No se ha encontrado el usuario a seguir.
 *      500:
 *        description: Error interno del servidor.
 */
router.put(
  "/follow/:seguido",
  auth.authenticate,
  validate(usuarioValidatorJs.usuarioFollowSchema),
  usuarioCon.usuarioFollow,
);

/**
 * @swagger
 * /usuario/unfollow/:seguido:
 *  put:
 *    summary: El usuario autenticado deja de seguir a otro usuario
 *    security:
 *      - bearerAuth: []
 *    tags: [Usuario]
 *    parameters:
 *       - in: params
 *         name: seguido
 *         description: Id del usuario a seguir
 *         schema:
 *           type: string
 *    responses:
 *      200:
 *        description: Éxito, el usuario autenticado sigue al usuario especificado
 *      400:
 *        description: Error en la petición.
 *      401:
 *        description: No autorizado, el usuario no tiene permiso para acceder.
 *      404:
 *        description: No se ha encontrado el usuario a dejar de seguir.
 *      500:
 *        description: Error interno del servidor.
 */
router.put(
  "/unfollow/:seguido",
  auth.authenticate,
  validate(usuarioValidatorJs.usuarioUnfollowSchema),
  usuarioCon.usuarioUnfollow,
);

export default router;
