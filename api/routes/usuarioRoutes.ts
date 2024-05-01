/**
 * @swagger
 * tags:
 *   name: Usuario
 *   description: Operaciones relacionadas con los usuarios de la aplicación
 * components:
 *   schemas:
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
 *              Seguidores:
 *                 type: array
 *                 items:
 *                   type: number
 *              Seguidos:
 *                 type: array
 *                 items:
 *                   type: number
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
 *      Audio:
 *          type: object
 *          properties:
 *              idAudio:
 *                  type: number
 *              titulo:
 *                  type: string
 *              path:
 *                  type: string
 *              fechaLanz:
 *                  type: date
 *              duracionSeg:
 *                  type: number
 *              esAlbum:
 *                  type: boolean
 *              esPodcast:
 *                  type: boolean
 *              esPrivada:
 *                  type: boolean
 *              imgAudio:
 *                  type: string
 *              vecesEscuchada:
 *                  type: number 
 *              Artistas:
 *                  type: object
 *                  properties:
 *                      idUsuario:
 *                          type: number
 *                      nombreUsuario:
 *                          type: string
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
 *              allOf:
 *               - $ref: '#/components/schemas/Usuario'
 *               - type: object
 *                 properties:
 *                    nEscuchas:
 *                      type: number  
 *                      description: Número de escuchas totales del usuario.
 *                    oyentesMensuales:
 *                      type: number
 *                      description: Número de oyentes del usuario.
 *                    ultimoLanzamiento:
 *                      type: object
 *                      properties:
 *                        idAudio:
 *                          type: number
 *                          description: Id del último audio lanzado por el usuario.
 *                        titulo:
 *                          type: string
 *                          description: Título del último audio lanzado por el usuario.
 *                        path:
 *                          type: string
 *                          description: Ruta del último audio lanzado por el usuario.
 *                        duracionSeg:
 *                          type: number
 *                          description: Duración en segundos del último audio lanzado por el usuario.
 *                        fechaLanz:
 *                          type: string
 *                          format: date-time
 *                          description: Fecha de lanzamiento del último audio lanzado por el usuario.
 *                        esAlbum:
 *                          type: boolean
 *                          description: Indica si el último lanzamiento es un álbum.
 *                        imgAudio:
 *                          type: string
 *                          description: Imagen del último audio lanzado por el usuario.
 *                        esPrivada:
 *                          type: boolean
 *                          description: Indica si el último lanzamiento es privado.
 *                        esPodcast:
 *                          type: boolean
 *                          description: Indica si el último lanzamiento es un podcast.
 *                    usuariosAlcanzados:
 *                      type: number
 *                      description: Número de usuarios distintos que han escuchado como mínimo una vez al usuario.
 *                    usuariosAlcanzadosUltimoMes:
 *                      type: number
 *                      description: Número de usuarios distintos que han escuchado al usuario en el último mes.
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
 *             schema:
 *               type: object
 *               properties:
 *                 cancion:
 *                   type: array
 *                   items:
 *                      $ref: '#/components/schemas/Audio'
 *                 podcast:
 *                   type: array
 *                   items:
 *                      $ref: '#/components/schemas/Audio'
 *                
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
 *      201:
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
 *      201:
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


/**
 * @swagger
 * /usuario/lastAudios/{numAudios}:
 *   get:
 *     summary: Obtiene las ultimas canciones y podcast escuchados por el usuario
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: numAudios
 *         required: true
 *         description: Número de audios a obtener
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Éxito, devuelve los últimos audios escuchados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cancion:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idUsuario:
 *                         type: number
 *                         description: ID del usuario
 *                       idAudio:
 *                         type: number
 *                         description: ID del audio
 *                       fecha:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha en que se escuchó el audio
 *                       Audio:
 *                         type: object
 *                         properties:
 *                           idAudio:
 *                             type: number
 *                             description: ID del audio
 *                           titulo:
 *                             type: string
 *                             description: Título del audio
 *                           path:
 *                             type: string
 *                             description: Ruta del audio
 *                           duracionSeg:
 *                             type: number
 *                             description: Duración del audio en segundos
 *                           fechaLanz:
 *                             type: string
 *                             format: date-time
 *                             description: Fecha de lanzamiento del audio
 *                           esAlbum:
 *                             type: boolean
 *                             description: Indica si el audio es parte de un álbum
 *                           imgAudio:
 *                             type: string
 *                             description: Imagen del audio
 *                           esPrivada:
 *                             type: boolean
 *                             description: Indica si el audio es privado
 *                           esPodcast:
 *                             type: boolean
 *                             description: Indica si el audio es un podcast
 *                           artistas:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 idUsuario:
 *                                   type: number
 *                                   description: ID del usuario
 *                 podcast:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idUsuario:
 *                         type: number
 *                         description: ID del usuario
 *                       idAudio:
 *                         type: number
 *                         description: ID del audio
 *                       fecha:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha en que se escuchó el audio
 *                       Audio:
 *                         type: object
 *                         properties:
 *                           idAudio:
 *                             type: number
 *                             description: ID del audio
 *                           titulo:
 *                             type: string
 *                             description: Título del audio
 *                           path:
 *                             type: string
 *                             description: Ruta del audio
 *                           duracionSeg:
 *                             type: number
 *                             description: Duración del audio en segundos
 *                           fechaLanz:
 *                             type: string
 *                             format: date-time
 *                             description: Fecha de lanzamiento del audio
 *                           esAlbum:
 *                             type: boolean
 *                             description: Indica si el audio es parte de un álbum
 *                           imgAudio:
 *                             type: string
 *                             description: Imagen del audio
 *                           esPrivada:
 *                             type: boolean
 *                             description: Indica si el audio es privado
 *                           esPodcast:
 *                             type: boolean
 *                             description: Indica si el audio es un podcast
 *                           artistas:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 idUsuario:
 *                                   type: number
 *                                   description: ID del usuario
 *       400:
 *         description: Error en la petición, faltan parámetros o el número de audios debe ser mayor que 0.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/lastAudios/:numAudios", auth.authenticate, usuarioCon.lastAudios);



/**
 * @swagger
 * /usuario/topAudios:
 *   get:
 *     summary: Obtiene los audios más escuchados de un usuario
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: numAudios
 *         required: true
 *         description: Número de audios a obtener
 *         schema:
 *           type: number
 *       - in: query
 *         name: userId
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Éxito, devuelve los audios más escuchados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   count:
 *                     type: number
 *                     description: Número de veces que se ha escuchado el audio
 *                   idAudio:
 *                     type: number
 *                     description: ID del audio
 *                   titulo:
 *                     type: string
 *                     description: Título del audio
 *                   path:
 *                     type: string
 *                     description: Ruta del audio
 *                   duracionSeg:
 *                     type: number
 *                     description: Duración del audio en segundos
 *                   fechaLanz:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de lanzamiento del audio
 *                   esAlbum:
 *                     type: boolean
 *                     description: Indica si el audio es parte de un álbum
 *                   imgAudio:
 *                     type: string
 *                     description: Imagen del audio
 *                   esPrivada:
 *                     type: boolean
 *                     description: Indica si el audio es privado
 *                   esPodcast:
 *                     type: boolean
 *                     description: Indica si el audio es un podcast
 *                   artistas:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         idUsuario:
 *                           type: number
 *                           description: ID del usuario
 *                         nombreUsuario:
 *                           type: string
 *                           description: Nombre del usuario
 *       400:
 *         description: Error en la petición, faltan parámetros o el número de audios debe ser mayor que 0.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/topAudios", auth.authenticate, usuarioCon.topAudios);


/**
 * @swagger
 * /usuario/historico:
 *   post:
 *     summary: Obtiene el historico del número de usuarios que han escuchado al usuario que hace la petición como mínimo una vez por fecha y el historico de escuchas totales de un usuario por fecha
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: MM-YYYY
 *                 description: Fecha en la que se quieren obtener las estadísticas
 *     responses:
 *       200:
 *         description: Éxito, devuelve el historico de escuchas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alcanceMensual:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: number
 *                         description: Mes del historico
 *                       year:
 *                         type: number
 *                         description: Año del historico
 *                       alcance:
 *                         type: number
 *                         description: Número de usuarios distintos que han escuchado al usuario mínimo una vez en el mes y año especificados
 *                 escuchasUsuarioMensuales:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: number
 *                         description: Mes del historico
 *                       year:
 *                         type: number
 *                         description: Año del historico
 *                       escuchas:
 *                         type: number
 *                         description: Número de escuchas totales del usuario en el mes y año especificados
 *       400:
 *         description: Falta parámetro date, formato de fecha incorrecto o fecha no válida
 *       403:
 *         description: No se tiene permiso para acceder a este recurso
 *       404:
 *         description: No se ha encontrado el audio con el id indicado
 */
router.post("/historico", auth.authenticate, usuarioCon.historico);




export default router;
