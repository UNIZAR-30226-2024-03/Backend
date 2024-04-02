import httpStatus from 'http-status';
import catchAsync from '../utils/errorHandling/utils/catchAsync.js';
import e, { Request} from 'express-jwt';
import { Response } from 'express';
import * as listasDb from '../../db/listaDb.js';
import * as sigueListaDb from '../../db/sigueListaDb.js';

//[POST]/lista/ : Crea una lista nueva.
//[DELETE]/lista/<idLista>/ : Borra una lista.
//[PUT]/lista/<idLista>/ : Edita una lista.
//[GET]/lista/<idLista>/ : Devuelve la información de una lista (audios que contiene incluidos)
//[POST]/lista/follow/<idLista>/<idUsuario> : Añade la lista a las seguidas por el usuario.
//[DELETE]/lista/follow/<idLista>/<idUsuario> : Elimina la lista de las seguidas por el usuario.
//[POST]/lista/audio/<idLista>/<idAudio> : Añade un audio a la lista.
//[DELETE]/lista/audio/<idLista>/<idAudio> : Elimina un audio de la lista.
///[POST]lista/collaborator/<idLista>/<idUsuario>/: Añade un colaborador a la lista.
///[DELETE]lista/collaborator/<idLista>/<idUsuario>/: Elimina un colaborador de la lista.
///[GET]listas/seguidas/<idUsuario>/: Devuelve las listas seguidas por un usuario.

/**
 * Función que devuelve true si el usuario es propietario de la lista o administrador
 * @param {ObjectId} idUsuario
 * @param {ObjectId} idLista
 * @returns {Promise<boolean>}
 * @throws {Error}
 */
const isOwnerOrAdmin = async (req: Request) => {
  // Comprobamos si el usuario del jwt es propietario de la lista o admin
  if (!req.auth?.esAdmin) {
    // No es admin, buscamos si es un propietario
    const propietarios = await listasDb.getPropietariosFromLista(parseInt(req.params.idLista));
    if (propietarios.length === 0) {
      throw new Error("Lista no encontrada");
    }
    if (!propietarios.includes(parseInt(req.auth?.idUsuario))) {
      return false;
    }
  }
  return true;
}




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
  const { nombre, descripcion, esPrivada, imgLista, esAlbum, tipoLista, idUsuario, audios } = req.body; 
  // No se necesita Seguidores porque al crear una lista no tiene seguidores
  // No necesita fechaUltimaMod porque se crea en el momento de la creación

  // createLista puede lanzar un error si el nombre de la lista ya existe por o que se debe capturar
  try {
    const lista = await listasDb.createLista(nombre, descripcion, esPrivada, esAlbum, imgLista, tipoLista, idUsuario, audios);
    res.status(httpStatus.CREATED).send(lista);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error)
  }

});


/**
 * Elimina una lista
 * @param {ObjectId} id
 * @returns {Promise<Lista>}
 */
export const deleteLista = catchAsync(async (req : Request, res : Response) => {
  try {
    if (!await isOwnerOrAdmin(req)) {
      res.status(httpStatus.UNAUTHORIZED).send("No tienes permisos para borrar esta lista");
      return;
    } 
    await listasDb.deleteListaById(parseInt(req.params.idLista));
    // Devolvermos el estado 204 (NO_CONTENT) porque no hay contenido que devolver y el mensaje de que se ha borrado correctamente
    res.status(httpStatus.NO_CONTENT).send("Lista borrada correctamente");

  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});

/**
 * Edita una lista
 * @param {ObjectId} id
 * @param {Object} updateBody Es un objeto de la forma: { nombre, descripcion, esPrivada, img, esAlbum, tipoLista, Audios, Propietarios }
 * @returns {Promise<Lista>}
 */
export const updateLista = catchAsync(async (req : Request, res : Response) => {
  try {
    if (!await isOwnerOrAdmin(req)) {
      res.status(httpStatus.UNAUTHORIZED).send("No tienes permisos para editar esta lista");
      return;
    }
    
    const {audios, propietarios, seguidores, ...resto} = req.body;

    const updateObject = {
      ...resto,
      audios: {connect: audios.map((idAudio: number) => ({idAudio}))},
      propietarios: {connect: propietarios.map((idUsuario: number) => ({idUsuario}))},
      // Seguidores: {connect: seguidores.map((idUsuario: number) => ({idUsuario}))},

    }

    console.log("updateObject", updateObject)

    const lista = await listasDb.updateListaById(parseInt(req.params.idLista), updateObject);

    console.log("lista", lista);
    res.send(lista);
  } catch (error) {
    console.log("error", error)
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});


/**
 * Devuelve la lista con el id dado
 * @param {ObjectId} id
 * @returns {Promise<Lista | null>}
 */
export const getListaById = catchAsync(async (req : Request, res : Response) => {
  try {
    const lista = await listasDb.getListaById(parseInt(req.params.idLista));
    if (!lista) res.status(httpStatus.NOT_FOUND).send("Lista no encontrada");
    else  {
      // Añadimos a la lista los audios que contiene
      const audios = await listasDb.getAudiosFromLista(parseInt(req.params.idLista));
    }
    
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});


/**
 * Devuelve los audios de una lista
 * @param {ObjectId} idLista
 * @returns {Promise<Audio[]>}
 */
export const getAudiosFromLista = catchAsync(async (req : Request, res : Response) => {
  try {
    const audios = await listasDb.getAudiosFromLista(parseInt(req.params.idLista));
    res.send(audios);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});


/**
 * Devuelve los propietarios de una lista
 * @param {ObjectId} idLista
 * @returns {Promise<Number[]>}
 */
export const getPropietariosFromLista = catchAsync(async (req : Request, res : Response) => {
  try {
    const propietarios = await listasDb.getPropietariosFromLista(parseInt(req.params.idLista));
    res.send(propietarios);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});


/**
 * Devuelve los seguidores de una lista
 * @param {ObjectId} idLista
 * @returns {Promise<Number[]>}
 */
export const getSeguidoresFromLista = catchAsync(async (req : Request, res : Response) => {
  try {
    const sigueListas = await sigueListaDb.sigueListaGetListByIdListaPrisma(parseInt(req.params.idLista));
    res.send(sigueListas.map((sigueLista) => sigueLista.idUsuario));
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});


/**
 * Devuelve la información de una lista (con audios, propietarios y seguidores)
 * @param {ObjectId} id
 * @returns {Promise<Lista | null>}
 */
export const getListaByIdWithExtras = catchAsync(async (req : Request, res : Response) => {
  try {
    // const audios = await listasDb.getAudiosFromLista(parseInt(req.params.idLista));
    // const propietarios = await listasDb.getPropietariosFromLista(parseInt(req.params.idLista));
    // const seguidores = await sigueListaDb.sigueListaGetListByIdListaPrisma(parseInt(req.params.idLista));
    const lista = await listasDb.getListaByIdWithExtras(parseInt(req.params.idLista));
    
    res.send({
      ...lista,
      // audios,
      // propietarios,
      // seguidores
    });
    
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});

/**
 * Añade la lista a las seguidas por el usuario.
 * @param {ObjectId} idLista
 * @param {ObjectId} idUsuario
  * @returns {Promise<SigueLista>}
 */
export const followLista = catchAsync(async (req : Request, res : Response) => {
  try {
    const sigueLista = await sigueListaDb.sigueListaCreatePrisma(parseInt(req.params.idLista), parseInt(req.auth?.idUsuario));
    res.status(httpStatus.CREATED).send(sigueLista);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});


/**
 * Elimina la lista de las seguidas por el usuario.
 * @param {ObjectId} idLista
 * @param {ObjectId} idUsuario
 * @returns {Promise<SigueLista>}
 */
export const unfollowLista = catchAsync(async (req : Request, res : Response) => {
  try {
    await sigueListaDb.sigueListaDeletePrisma(parseInt(req.params.idLista), parseInt(req.auth?.idUsuario));
    res.status(httpStatus.NO_CONTENT).send();
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});

/**
 * Devuelve las listas seguidas por un usuario
 * @param {ObjectId} idUsuario
 * @returns {Promise<SigueLista[]>}
 */
export const getFollowedLists = catchAsync(async (req : Request, res : Response) => {
  try {
    const sigueListas = await sigueListaDb.sigueListaGetListPrisma(parseInt(req.params.idUsuario));
    
    const listas = await Promise.all(sigueListas.map(async (sigueLista) => {
      return await listasDb.getListaById(sigueLista.idLista);
    }));
    
    res.send(listas);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});


/**
 * Añade un audio a la lista.
 * @param {ObjectId} idLista
 * @param {ObjectId} idAudio
 * @returns {Promise<AudiosLista>}
 */
export const addAudioToLista = catchAsync(async (req : Request, res : Response) => {
  try {
    if (!await isOwnerOrAdmin(req)) {
      res.status(httpStatus.UNAUTHORIZED).send("No tienes permisos para añadir un audio a esta lista");
      return;
    }

    await listasDb.addAudioToLista(parseInt(req.params.idLista), parseInt(req.params.idAudio));
    // Como se ha añadido un audio a la lista, se actualiza la fecha de última modificación
    // No debería fallar porque solo se actualiza la fecha, si pudiese fallar
    // debería hacerse una transacción con las dos operaciones
    await listasDb.updateListaById(parseInt(req.params.idLista), { fechaUltimaMod: new Date() });
    res.status(httpStatus.CREATED).send();
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});


/**
 * Elimina un audio de la lista.
 * @param {ObjectId} idLista
 * @param {ObjectId} idAudio
 * @returns {Promise<AudiosLista>}
 */
export const deleteAudioFromLista = catchAsync(async (req : Request, res : Response) => {
  try {
    if (!await isOwnerOrAdmin(req)) {
      res.status(httpStatus.UNAUTHORIZED).send("No tienes permisos para eliminar un audio de esta lista");
      return;
    }

    await listasDb.deleteAudioFromLista(parseInt(req.params.idLista), parseInt(req.params.idAudio));
    // Como se ha eliminado un audio de la lista, se actualiza la fecha de última modificación
    await listasDb.updateListaById(parseInt(req.params.idLista), { fechaUltimaMod: new Date() });
    res.status(httpStatus.NO_CONTENT).send();
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});


/**
 * Añade un colaborador a la lista.
 * @param {ObjectId} idLista
 * @param {ObjectId} idUsuario
 * @returns {Promise<Lista>}
 */
export const addCollaboratorToLista = catchAsync(async (req : Request, res : Response) => {
  try {
    if (!await isOwnerOrAdmin(req)) {
      res.status(httpStatus.UNAUTHORIZED).send("No tienes permisos para añadir un colaborador a esta lista");
      return;
    }

    const lista = await listasDb.addPropietarioToLista(parseInt(req.params.idLista), parseInt(req.params.idUsuario));
    res.send(lista);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});


/**
 * Elimina un colaborador de la lista.
 * @param {ObjectId} idLista
 * @param {ObjectId} idUsuario
 * @returns {Promise<Lista>}
 */
export const deleteCollaboratorFromLista = catchAsync(async (req : Request, res : Response) => {
  try {
    if (!await isOwnerOrAdmin(req)) {
      res.status(httpStatus.UNAUTHORIZED).send("No tienes permisos para eliminar un colaborador de esta lista");
      return;
    }
    const lista = await listasDb.deletePropietarioFromLista(parseInt(req.params.idLista), parseInt(req.params.idUsuario));
    res.send(lista);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});


/**
 * Devuelve las listas creadas por un usuario
 * @param {ObjectId} idUsuario
 * @returns {Promise<Lista[]>}
 */
export const getListsByUser = catchAsync(async (req : Request, res : Response) => {
  try {
    const listas = await listasDb.getListasByPropietario(parseInt(req.params.idUsuario));
    res.send(listas);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});