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
 *      - in: query
 *        idUsuario:
 *          type: integer
 *          description: Id del usuario a obtener
 *        rrss:
 *          type: boolean
 *          description: Indica si se quiere obtener las redes sociales del usuario
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
 *      - in: params
 *        seguido:
 *          type: integer
 *          description: Id del usuario a seguir
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
 *      - in: params
 *        seguido:
 *          type: integer
 *          description: Id del usuario a dejar de seguir
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
