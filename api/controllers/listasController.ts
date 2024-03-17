import httpStatus from 'http-status';
import pick from '../utils/errorHandling/utils/pick';
import ApiError from '../utils/errorHandling/utils/ApiError';
import catchAsync from '../utils/errorHandling/utils/catchAsync';
import { Request, Response } from 'express';
import * as listasDb from '../../db/listaDb';
import * as sigueListaDb from '../../db/sigueListaDb';


//[POST]/lista/ : Crea una lista nueva.
//[DELETE]/lista/<idLista>/ : Borra una lista.
//[PUT]/lista/<idLista>/ : Edita una lista.
//[GET]/lista/<idLista>/ : Devuelve la información de una lista (audios que contiene incluidos)
//[POST]/lista/follow/<idLista>/<idUsuario> : Añade la lista a las seguidas por el usuario.
//[DELETE]/lista/follow/<idLista>/<idUsuario> : Elimina la lista de las seguidas por el usuario.
//[POST]/lista/audio/<idLista>/<idAudio> : Añade un audio a la lista.
//[DELETE]/lista/audio/<idLista>/<idAudio> : Elimina un audio de la lista.
///lista/add-collaborator/<idLista>/<idUsuario>/: Añade un colaborador a la lista.



/**
 * Crea una lista nueva
  * @param {ObjectId} idUsuario
  * @param {string} nombre
  * @param {string} descripcion
  * @param {boolean} esPrivada
  * @param {string} img
  * @param {boolean} esAlbum
  * @param {TipoLista} tipoLista
  * @param {number[]} audios
  * @returns {Promise<Lista>}
 */
export const createLista = catchAsync(async (req : Request, res : Response) => {
  const { nombre, descripcion, esPrivada, img, esAlbum, tipoLista, idUsuario, audios } = req.body; 
  // No se necesita Seguidores porque al crear una lista no tiene seguidores
  // No necesita fechaUltimaMod porque se crea en el momento de la creación
  const lista = await listasDb.createLista(nombre, descripcion, esPrivada, img, esAlbum, tipoLista, idUsuario, audios);
  res.status(httpStatus.CREATED).send(lista);
});


/**
 * Elimina una lista
 * @param {ObjectId} id
 * @returns {Promise<Lista>}
 */
export const deleteLista = catchAsync(async (req : Request, res : Response) => {
  await listasDb.deleteListaById(parseInt(req.params.ListaId));
  res.status(httpStatus.NO_CONTENT).send();
});


/**
 * Edita una lista
 * @param {ObjectId} id
 * @param {Object} updateBody Es un objeto de la forma: { nombre, descripcion, esPrivada, imgLista, tipoLista, audios }
 * @returns {Promise<Lista>}
 * @throws {ApiError}
 */
export const updateLista = catchAsync(async (req : Request, res : Response) => {
  const lista = await listasDb.updateListaById(parseInt(req.params.ListaId), req.body);
  res.send(lista);
});


/**
 * Devuelve la lista con el id dado
 * @param {ObjectId} id
 * @returns {Promise<Lista | null>}
 * @throws {ApiError}
 */
export const getListaById = catchAsync(async (req : Request, res : Response) => {
  const lista = await listasDb.getListaById(parseInt(req.params.ListaId));
  if (!lista) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lista not found');
  }
  res.send(lista);
});


/**
 * Añade la lista a las seguidas por el usuario.
 * @param {ObjectId} idLista
 * @param {ObjectId} idUsuario
 * @returns {Promise<Lista>}
 */
export const followLista = catchAsync(async (req : Request, res : Response) => {
  const lista = await listasDb.followLista(parseInt(req.params.ListaId), parseInt(req.params.UserId));
  res.send(lista);
});

