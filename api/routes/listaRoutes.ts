/**
 * @swagger
 * tags:
 *   name: Listas
 *   description: Operaciones relacionadas con las listas de audios
 */
/**
 * @swagger
 * components:
 *  schemas:
 *      Lista:
 *          type: object
 *          required:
 *             - nombre
 *             - esAlbum
 *             - esPrivada
 *             - tipoLista
 *             - idUsuario
 *          properties:
 *              idLista:
 *                  type: number
 *                  description: Identificador de la lista
 *              nombre:
 *                  type: string
 *                  description: Nombre de la lista
 *              esAlbum:
 *                  type: boolean
 *                  description: Indica si la lista es un album
 *              esPrivada:
 *                  type: boolean
 *                  description: Indica si la lista es privada
 *              descripcion:
 *                  type: string
 *                  description: Descripción de la lista
 *              imgLista:
 *                  type: string
 *                  description: uri de la imagen de la lista
 *              tipoLista:
 *                  type: string
 *                  description: Tipo de lista
 *                  enum: ["MIS_AUDIOS", "MIS_FAVORITOS", "MIS_PODCAST", "NORMAL"]
 *              fechaUltimaMod:
 *                  type: string
 *                  description: Fecha de última modificación de la lista
 *          example:
 *              idLista: 1
 *              nombre: "Lista de ejemplo"
 *              esAlbum: false
 *              esPrivada: false
 *              descripcion: "Descripción de la lista"
 *              imgLista: "adsfas-asdfaijlk-a"
 *              tipoLista: "NORMAL"
 *              idUsuario: 1
 *              fechaUltimaMod: "2021-06-01T12:00:00Z"
 *      TipoLista:
 *          type: string
 *          enum: ["MIS_AUDIOS", "MIS_FAVORITOS", "MIS_PODCAST", "NORMAL"]
 *          description: Tipo de lista, "MIS_AUDIOS", "MIS_FAVORITOS", "MIS_PODCAST" están reservados para las listas creadas por defecto para un usuario al crear su cuenta.
 *      Audio:
 *          type: object
 *          required:
 *             - idAudio
 *             - titulo
 *             - duracion
 *             - fechaSubida
 *             - idUsuario
 *          properties:
 *              idAudio:
 *                  type: number
 *                  description: Identificador del audio
 *              titulo:
 *                  type: string
 *                  description: Título del audio
 *              path:
 *                  type: string
 *                  description: uri del audio
 *              duracion:
 *                  type: number
 *                  description: Duración del audio en segundos
 *              fechaLanz:
 *                  type: string
 *                  description: Fecha de subida del audio
 *              esAlbum:
 *                  type: boolean
 *                  description: Indica si el audio es un album
 *              imgAudio:
 *                  type: string
 *                  description: uri de la imagen del audio
 *              esPrivada:
 *                  type: boolean
 *                  description: Indica si el audio es privado
 *          example:
 *              idAudio: 1
 *              titulo: "Audio de ejemplo"
 *              duracion: 120
 *              fechaSubida: "2021-06-01T12:00:00Z"
 *              idUsuario: 1
 *      Usuario:
 *          type: object
 *          required:
 *             - idUsuario
 *             - nombre
 *             - apellidos
 *             - email
 *          properties:
 *              idUsuario:
 *                  type: number
 *                  description: Identificador del usuario
 *              nombreUsuario:
 *                  type: string
 *                  description: Nombre del usuario
 *              email:
 *                  type: string
 *                  description: Email del usuario
 *              esAdmin:
 *                  type: boolean
 *                  description: Indica si el usuario es administrador
 *              contrasegna:
 *                  type: string
 *                  description: Contraseña del usuario
 *              imgPerfil:
 *                  type: string
 *                  description: uri de la imagen de perfil del usuario
 *              idUltimoAudio:
 *                  type: number
 *                  description: Identificador del último audio escuchado por el usuario
 *              segFinAudio:
 *                  type: number
 *                  description: Segundo en el que se quedó el usuario en el último audio escuchado
 *      SigueLista:
 *          type: object
 *          required:
 *             - idUsuario
 *             - idLista
 *          properties:
 *              idUsuario:
 *                  type: number
 *                  description: Identificador del usuario
 *              idLista:
 *                  type: number
 *                  description: Identificador de la lista
 *              ultimaEscucha:
 *                  type: string
 *                  description: Fecha de la última escucha
 *          example:
 *              idUsuario: 1
 *              idLista: 1
 *              ultimaEscucha: "2021-06-01T12:00:00Z"
 */
import express, { Express, Request, Response } from "express";
export const listaRouter = express.Router();
import * as auth from "../middleware/authenticator.js";

import * as listaController from "../controllers/listaController.js";


// CUALQUIER PETICIÓN DE CONSULTA DE INFORMACIÓN DEVOLVERÁ EL RESULTADO SOBRE LA INFORMACIÓN
// A LA QUE EL USUARIO TENGA ACCESO, ES DECIR, SI EL USUARIO NO ES PROPIETARIO O ADMIN SOLO 
// PODRÁ ACCEDER A LA INFORMACIÓN PÚBLICA


//[POST]/lista/ : Crea una lista nueva.
/**
 * @swagger
 * /lista/:
 *   post:
 *     tags: [Listas]
 *     summary: Crea una lista nueva.
 *     description: Crea una lista nueva en la que el propietario es el usuario del jwt.
 *     requestBody:
 *       content:
 *          application/json:
 *             schema:
 *                type: object
 *                properties:
 *                   nombre:
 *                      type: string
 *                   esAlbum:
 *                      type: boolean
 *                   esPrivada:
 *                      type: boolean
 *                   descripcion:
 *                      type: string
 *                   imgLista:
 *                      type: string
 *                   tipoLista:
 *                      $ref: '#/components/schemas/TipoLista'
 *                   audios:
 *                      type: array
 *                      items:
 *                         type: number
 *     security:
 *        - bearerAuth: []
 *     responses:
 *        200:
 *           description: Lista creada correctamente.
 *           content:
 *              application/json:
 *                 schema:
 *                    $ref: '#/components/schemas/Lista'
 *        400:
 *           description: Error en la petición.
 * 
 */
listaRouter.post("/", auth.authenticate, listaController.createLista);

//[DELETE]/lista/<idLista>/ : Borra una lista.
/**
 * @swagger
 * /lista/{idLista}:
 *   delete:
 *     tags: [Listas]
 *     summary: Borra una lista.
 *     description: Borra una lista si el usuario es propietario o administrador.
 *   parameters:
 *     - in: path
 *       name: idLista
 *       required: true
 *       description: Id de la lista a borrar.
 *       schema:
 *          type: number
 *   security:
 *      - bearerAuth: []
 *   responses:
 *      204:
 *         description: Lista borrada correctamente.
 *      401:
 *         description: No autorizado para borrar la lista.
 *      400:
 *         description: Error en la petición.
 *      404:
 *         description: No se ha encontrado la lista.
 * 
 */
listaRouter.delete("/:idLista", auth.authenticate, listaController.deleteLista); 

//[PUT]/lista/<idLista>/ : Edita una lista.
/**
 * @swagger
 * /lista/{idLista}:
 *   put:
 *     tags: [Listas]
 *     summary: Edita una lista.
 *     description: Edita una lista si el usuario es propietario o administrador. Los audios que se especifiquen en la petición serán añadidos a la lista junto con los que ya tuviera.
 *     requestBody:
 *       content:
 *          application/json:
 *             schema:
 *                $ref: '#/components/schemas/Audio'
 *     parameters:
 *       - in: path
 *         name: idLista
 *         required: true
 *         description: Id de la lista a editar.
 *         schema:
 *            type: number
 *     responses:
 *        200:
 *           description: Lista editada correctamente.
 *           content:
 *              application/json:
 *                 schema:
 *                    $ref: '#/components/schemas/Lista'
 *        400:
 *           description: Error en la petición.
 *        401:
 *           description: No autorizado para editar la lista.
 *        404:
 *           description: No se ha encontrado la lista.
 * 
 */
listaRouter.put("/:idLista", auth.authenticate, listaController.updateLista);

//[GET]/lista/<idLista>/ : Devuelve la información de una lista (sin audios, propietarios ni seguidores)
/**
 * @swagger
 * /lista/{idLista}:
 *   get:
 *     tags: [Listas] 
 *     summary: Devuelve la información de una lista (sin audios, propietarios ni seguidores)
 *     description: Devuelve la información de una lista (sin audios, propietarios ni seguidores)
 *     parameters:
 *       - in: path
 *         name: idLista
 *         required: true
 *         description: Id de la lista a obtener.
 *         schema:
 *            type: number
 *     responses:
 *        200:
 *           description: Lista obtenida correctamente.
 *           content:
 *              application/json:
 *                 schema:
 *                    $ref: '#/components/schemas/Lista'
 *        400:
 *           description: Error en la petición.
 *        404:
 *           description: No se ha encontrado la lista.
 * 
 */
listaRouter.get("/:idLista", auth.authenticate, listaController.getListaById);

//[GET]/lista/extra/Audios/<idLista>/ : Devuelve los audios de una lista.
/**
 * @swagger
 * /lista/extra/Audios/{idLista}:
 *   get:
 *     tags: [Listas]
 *     summary: Devuelve los audios de una lista.
 *     description: Devuelve los audios de una lista si es pública o si el usuario es propietario o administrador. Devolverá solo los audios públicos o los privados si el usuario es propietario o administrador
 *     parameters:
 *       - in: path
 *         name: idLista
 *         required: true
 *         description: Id de la lista a obtener los audios.
 *         schema:
 *            type: number
 *     responses:
 *        200:
 *           description: Audios obtenidos correctamente.
 *           content:
 *              application/json:
 *                 schema:
 *                    type: array
 *                    items:
 *                       $ref: '#/components/schemas/Audio'
 *        400:
 *           description: Error en la petición.
 *        404:
 *           description: No se ha encontrado la lista.
 * 
 */
listaRouter.get("/extra/Audios/:idLista", auth.authenticate, listaController.getAudiosFromLista);

//[GET]/lista/extra/Propietarios/<idLista>/ : Devuelve los propietarios de una lista.
/**
 * @swagger
 * /lista/extra/Propietarios/{idLista}:
 *   get:
 *     tags: [Listas]
 *     summary: Devuelve los propietarios de una lista.
 *     description: Devuelve los propietarios de una lista si es pública o si el usuario es propietario o administrador.
 *     parameters:
 *       - in: path
 *         name: idLista
 *         required: true
 *         description: Id de la lista a obtener los propietarios.
 *         schema:
 *            type: number
 *     responses:
 *        200:
 *           description: Propietarios obtenidos correctamente.
 *           content:
 *              application/json:
 *                 schema:
 *                    type: array
 *                    items:
 *                       $ref: '#/components/schemas/Usuario'
 *
 *        400:
 *           description: Error en la petición.
 *        401:
 *           description: No autorizado para interactuar con la lista.
 *        404:
 *           description: No se ha encontrado la lista.
 * 
 */
listaRouter.get("/extra/Propietarios/:idLista", auth.authenticate, listaController.getPropietariosFromLista);

//[GET]/lista/extra/Seguidores/<idLista>/ : Devuelve los seguidores de una lista.
/**
 * @swagger
 * /lista/extra/Seguidores/{idLista}:
 *   get:
 *     tags: [Listas]
 *     summary: Devuelve los seguidores de una lista.
 *     description: Devuelve los seguidores de una lista si es pública o si el usuario es propietario o administrador.
 *     parameters:
 *       - in: path
 *         name: idLista
 *         required: true
 *         description: Id de la lista a obtener los seguidores.
 *         schema:
 *            type: number
 *     responses:
 *        200:
 *           description: Seguidores obtenidos correctamente.
 *           content:
 *              application/json:
 *                 schema:
 *                    type: array
 *                    items:
 *                       $ref: '#/components/schemas/SigueLista'
 *        400:
 *           description: Error en la petición.
 *        401:
 *           description: No autorizado para interactuar con la lista.
 *        404:
 *           description: No se ha encontrado la lista.
 * 
 */
listaRouter.get("/extra/Seguidores/:idLista", auth.authenticate, listaController.getSeguidoresFromLista);

//[GET]/lista/extra/<idLista>/ : Devuelve la información de una lista (con audios, propietarios y seguidores)
/**
 * @swagger
 * /lista/extra/{idLista}:
 *   get:
 *     tags: [Listas]
 *     summary: Devuelve la información de una lista (con audios, propietarios y seguidores)
 *     description: Devuelve la información de una lista (con audios, propietarios y seguidores) si es pública o si el usuario es propietario o administrador. Solo se incluirán los audios públicos o los privados si el usuario es propietario o administrador de la lista.
 *     parameters:
 *       - in: path
 *         name: idLista
 *         required: true
 *         description: Id de la lista a obtener.
 *         schema:
 *            type: number
 *     responses:
 *        200:
 *           description: Lista obtenida correctamente.
 *           content:
 *              application/json:
 *                 schema:
 *                    type: object
 *                    properties:
 *                       idLista:
 *                          type: number
 *                          description: Identificador de la lista
 *                       nombre:
 *                          type: string
 *                          description: Nombre de la lista
 *                       esAlbum:
 *                          type: boolean
 *                          description: Indica si la lista es un album
 *                       esPrivada:
 *                          type: boolean
 *                          description: Indica si la lista es privada
 *                       descripcion:
 *                          type: string
 *                          description: Descripción de la lista
 *                       imgLista:
 *                          type: string
 *                          description: uri de la imagen de la lista
 *                       tipoLista:
 *                          $ref: '#/components/schemas/TipoLista'
 *                       fechaUltimaMod:
 *                          type: string
 *                          description: Fecha de última modificación de la lista
 *                       Audios:
 *                          type: array
 *                          items:
 *                             $ref: '#/components/schemas/Audio'
 *                       Propietarios:
 *                          type: array
 *                          items:
 *                             $ref: '#/components/schemas/Usuario'
 *                       Seguidores:
 *                          type: array
 *                          items:
 *                             $ref: '#/components/schemas/SigueLista'
 *        400:
 *           description: Error en la petición.
 *        401:
 *           description: No autorizado para interactuar con la lista.
 *        404:
 *           description: No se ha encontrado la lista.
 * 
 */
listaRouter.get("/extra/:idLista", auth.authenticate, listaController.getListaByIdWithExtras);

//[POST]/lista/follow/<idLista>/ : Añade la lista a las seguidas por el usuario del jwt.
/**
 * @swagger
 * /lista/follow/{idLista}/:
 *   post:
 *     tags: [Listas]
 *     summary: Añade la lista a las seguidas por el usuario del jwt.
 *     description: Añade la lista a las seguidas por el usuario del jwt. Solo si la lista es pública o si el usuario es propietario o administrador.
 *     parameters:
 *       - in: path
 *         name: idLista
 *         required: true
 *         description: Id de la lista a seguir.
 *         schema:
 *            type: number
 *     security:
 *        - bearerAuth: []
 *     responses:
 *        200:
 *           description: Lista seguida correctamente.
 *           content:
 *              application/json:
 *                 schema:
 *                    $ref: '#/components/schemas/SigueLista'
 *        400:
 *           description: Error en la petición.
 *        401:
 *           description: No autorizado para seguir la lista.
 *        404:
 *           description: No se ha encontrado la lista.
 * 
 */
listaRouter.post("/follow/:idLista/", auth.authenticate, listaController.followLista);

//[DELETE]/lista/follow/<idLista>/ : Elimina la lista de las seguidas por el usuario del jwt.
/**
 * @swagger
 * /lista/follow/{idLista}/:
 *   delete:
 *     tags: [Listas]
 *     summary: Elimina la lista de las seguidas por el usuario del jwt.
 *     description: Elimina la lista de las seguidas por el usuario del jwt. Da igual si la lista es pública o si el usuario es propietario o administrador.
 *     parameters:
 *       - in: path
 *         name: idLista
 *         required: true
 *         description: Id de la lista a dejar de seguir.
 *         schema:
 *            type: number
 *     security:
 *        - bearerAuth: []
 *     responses:
 *        204:
 *           description: Lista dejada de seguir correctamente.
 *        400:
 *           description: Error en la petición.
 *        404:
 *           description: No se ha encontrado la lista.
 * 
 */
listaRouter.delete("/follow/:idLista/", auth.authenticate, listaController.unfollowLista);

//[POST]/lista/audio/<idLista>/<idAudio> : Añade un audio a la lista.
/**
 * @swagger
 * /lista/audio/{idLista}/{idAudio}:
 *   post:
 *     tags: [Listas]
 *     summary: Añade un audio a la lista.
 *     description: Añade un audio a la lista si el usuario es propietario o administrador.
 *     parameters:
 *       - in: path
 *         name: idLista
 *         required: true
 *         description: Id de la lista a la que añadir el audio.
 *         schema:
 *            type: number
 *       - in: path
 *         name: idAudio
 *         required: true
 *         description: Id del audio a añadir.
 *         schema:
 *            type: number
 *     security:
 *        - bearerAuth: []
 *     responses:
 *        200:
 *           description: Audio añadido correctamente.
 *        400:
 *           description: Error en la petición.
 *        401:
 *           description: No autorizado para añadir el audio.
 *        404:
 *           description: No se ha encontrado la lista o el audio.
 * 
 */
listaRouter.post("/audio/:idLista/:idAudio", auth.authenticate, listaController.addAudioToLista);

//[DELETE]/lista/audio/<idLista>/<idAudio> : Elimina un audio de la lista.
/**
 * @swagger
 * /lista/audio/{idLista}/{idAudio}:
 *   delete:
 *     tags: [Listas]
 *     summary: Elimina un audio de la lista.
 *     description: Elimina un audio de la lista si el usuario es propietario o administrador.
 *     parameters:
 *       - in: path
 *         name: idLista
 *         required: true
 *         description: Id de la lista a la que eliminar el audio.
 *         schema:
 *            type: number
 *       - in: path
 *         name: idAudio
 *         required: true
 *         description: Id del audio a eliminar.
 *         schema:
 *            type: number
 *     security:
 *        - bearerAuth: []
 *     responses:
 *        204:
 *           description: Audio eliminado correctamente.
 *        400:
 *           description: Error en la petición.
 *        401:
 *           description: No autorizado para eliminar el audio.
 *        404:
 *           description: No se ha encontrado la lista o el audio.
 * 
 */
listaRouter.delete("/audio/:idLista/:idAudio", auth.authenticate, listaController.deleteAudioFromLista);

//[POST]lista/collaborator/<idLista>/<idUsuario>/: Añade un colaborador a la lista.
/**
 * @swagger
 * /lista/collaborator/{idLista}/{idUsuario}:
 *   post:
 *     tags: [Listas]
 *     summary: Añade un colaborador a la lista.
 *     description: Añade un colaborador a la lista si el usuario es propietario o administrador.
 *     parameters:
 *       - in: path
 *         name: idLista
 *         required: true
 *         description: Id de la lista a la que añadir el colaborador.
 *         schema:
 *            type: number
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         description: Id del usuario a añadir como colaborador.
 *         schema:
 *            type: number
 *     security:
 *        - bearerAuth: []
 *     responses:
 *        200:
 *           description: Colaborador añadido correctamente.
 *           content:
 *              application/json:
 *                 schema:
 *                    $ref: '#/components/schemas/Usuario'
 *        400:
 *           description: Error en la petición.
 *        401:
 *           description: No autorizado para añadir el colaborador.
 *        404:
 *           description: No se ha encontrado la lista o el usuario.
 */
listaRouter.post("/collaborator/:idLista/:idUsuario", auth.authenticate, listaController.addCollaboratorToLista);

//[DELETE]lista/collaborator/<idLista>/<idUsuario>/: Elimina un colaborador de la lista.
/**
 * @swagger
 * /lista/collaborator/{idLista}/{idUsuario}:
 *   delete:
 *     tags: [Listas]
 *     summary: Elimina un colaborador de la lista.
 *     description: Elimina un colaborador de la lista si el usuario es propietario o administrador.
 *     parameters:
 *       - in: path
 *         name: idLista
 *         required: true
 *         description: Id de la lista a la que eliminar el colaborador.
 *         schema:
 *            type: number
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         description: Id del usuario a eliminar como colaborador.
 *         schema:
 *            type: number
 *     security:
 *        - bearerAuth: []
 *     responses:
 *        204:
 *           description: Colaborador eliminado correctamente.
 *           content:
 *              application/json:
 *                 schema:
 *                    $ref: '#/components/schemas/Usuario'
 *        400:
 *           description: Error en la petición.
 *        401:
 *           description: No autorizado para eliminar el colaborador.
 *        404:
 *           description: No se ha encontrado la lista o el usuario.
 */
listaRouter.delete("/collaborator/:idLista/:idUsuario", auth.authenticate, listaController.deleteCollaboratorFromLista);

//[GET]listas/seguidas/<idUsuario>/: Devuelve las listas seguidas por un usuario.
/**
 * @swagger
 * /listas/seguidas/{idUsuario}:
 *   get:
 *     tags: [Listas]
 *     summary: Devuelve las listas seguidas por un usuario.
 *     description: Devuelve las listas seguidas por un usuario.
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         description: Id del usuario a obtener las listas seguidas.
 *         schema:
 *            type: number
 *     security:
 *        - bearerAuth: []
 *     responses:
 *        200:
 *           description: Listas seguidas obtenidas correctamente.
 *           content:
 *              application/json:
 *                 schema:
 *                    type: array
 *                    items:
 *                       $ref: '#/components/schemas/SigueLista'
 *        400:
 *           description: Error en la petición.
 *        404:
 *           description: No se ha encontrado el usuario.
 */
listaRouter.get("/seguidas/:idUsuario", auth.authenticate, listaController.getFollowedLists);

//[GET]listas/owned/<idUsuario>/: Devuelve las listas de las que un usuario es propietario.
/**
 * @swagger
 * /listas/owned/{idUsuario}:
 *   get:
 *     tags: [Listas]
 *     summary: Devuelve las listas de las que un usuario es propietario.
 *     description: Devuelve las listas de las que un usuario es propietario.
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         description: Id del usuario a obtener las listas propietarias.
 *         schema:
 *            type: number
 *     security:
 *        - bearerAuth: []
 *     responses:
 *        200:
 *           description: Listas propietarias obtenidas correctamente.
 *           content:
 *              application/json:
 *                 schema:
 *                    type: array
 *                    items:
 *                       $ref: '#/components/schemas/Lista'
 *        400:
 *           description: Error en la petición.
 *        404:
 *           description: No se ha encontrado el usuario.
 */
listaRouter.get("/owned/:idUsuario", auth.authenticate, listaController.getListasByPropietario);


export default listaRouter;