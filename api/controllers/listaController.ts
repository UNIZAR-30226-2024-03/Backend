import httpStatus from 'http-status';
import catchAsync from '../utils/errorHandling/utils/catchAsync.js';
import e, { Request} from 'express-jwt';
import { Response } from 'express';
import * as listasDb from '../../db/listaDb.js';
import * as sigueListaDb from '../../db/sigueListaDb.js';
import * as audioDb from '../../db/audioDb.js';
import * as usuarioDb from '../../db/usuarioDb.js';
import { Audio } from '@prisma/client';


/**
 * Función que devuelve true si el idUsuario es propietario de la lista o administrador
  * @param {number} idItem
  * @param {number} idUsuario
  * @param {boolean} esAdmin
 * @returns {Promise<boolean>}
 * @throws {Error}
 */
const isOwnerOrAdmin = async (idItem : number, idUsuario : number, esAdmin : Boolean, esAudio : Boolean = false) => {
  // Comprobamos si el usuario del jwt es propietario de la lista o admin
  if (!esAdmin) {
    if (esAudio) {
      const artistas = await audioDb.getArtistaAudioById(idItem);
      if (!artistas) {
        throw new Error("Audio no encontrado");
      }
      return artistas.includes(idUsuario);
      
    } else {
      // No es admin, buscamos si es un propietario
      const propietarios = await listasDb.getPropietariosFromLista(idItem);
      if (!propietarios.includes(idUsuario)) {
        return false;
      }
    }
  }
  return true;
}




/**
 * Crea una lista nueva de la que el usuario del jwt será propietario
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
  const { nombre, descripcion, esPrivada, imgLista, esAlbum, tipoLista, audios } = req.body; 
  // No se necesita Seguidores porque al crear una lista no tiene seguidores
  // No necesita fechaUltimaMod porque se crea en el momento de la creación

  // createLista puede lanzar un error si el nombre de la lista ya existe por o que se debe capturar
  try {
    const lista = await listasDb.createLista(nombre, descripcion, esPrivada, esAlbum, imgLista, tipoLista, req.auth?.idUsuario, audios);
    res.status(httpStatus.CREATED).send(lista);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error)
  }

});


/**
 * Elimina una lista si el usuario es propietario o administrador
 * @param {ObjectId} id
 * @returns {Promise<Lista>}
 */
export const deleteLista = catchAsync(async (req : Request, res : Response) => {
  try {
    if (!await listasDb.getListaById(parseInt(req.params.idLista))) {
      res.status(httpStatus.NOT_FOUND).send("Lista no encontrada");
      return;
    }

    if (!await isOwnerOrAdmin(parseInt(req.params.idLista), req.auth?.idUsuario, req.auth?.esAdmin)) {
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
 * Edita una lista si el usuario es propietario o administrador
 * @param {ObjectId} id
 * @param {Object} updateBody Es un objeto de la forma: { nombre, descripcion, esPrivada, img, esAlbum, tipoLista, Audios, Propietarios }
 * @returns {Promise<Lista>}
 */
export const updateLista = catchAsync(async (req : Request, res : Response) => {
  try {
    if (!await listasDb.getListaById(parseInt(req.params.idLista))) {
      res.status(httpStatus.NOT_FOUND).send("Lista no encontrada");
      return;
    }

    if (!await isOwnerOrAdmin(parseInt(req.params.idLista), req.auth?.idUsuario, req.auth?.esAdmin)) {
      res.status(httpStatus.UNAUTHORIZED).send("No tienes permisos para editar esta lista");
      return;
    }
    
    const {audios, propietarios, seguidores, ...resto} = req.body;

    const updateObject = {
      ...resto,
    }

    if (audios) {
      updateObject.Audios = {connect: audios.map((idAudio: number) => ({idAudio}))};
    }

    if (propietarios) {
      updateObject.Propietarios = {connect: propietarios.map((idUsuario: number) => ({idUsuario}))};
    }

    // console.log("updateObject", updateObject)

    const lista = await listasDb.updateListaById(parseInt(req.params.idLista), updateObject);

    // console.log("lista", lista);
    res.send(lista);
  } catch (error) {
    // console.log("error", error)
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});


/**
 * Devuelve la lista con el id dado si es pública o si el usuario es propietario o administrador
 * @param {ObjectId} id
 * @returns {Promise<Lista | null>}
 */
export const getListaById = catchAsync(async (req : Request, res : Response) => {
  try {
    const lista = await listasDb.getListaById(parseInt(req.params.idLista));
    if (!lista){
      res.status(httpStatus.NOT_FOUND).send("Lista no encontrada");
      return;
    }

    if (lista.esPrivada && !await isOwnerOrAdmin(parseInt(req.params.idLista), req.auth?.idUsuario, req.auth?.esAdmin)) {
      res.status(httpStatus.UNAUTHORIZED).send("No tienes permisos para interactuar con esta lista");
      return;
    }
    
    res.send(lista);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});


/**
 * Devuelve los audios de una lista si es pública o si el usuario es propietario o administrador
 * Devolverá solo los audios públicos o los privados si el usuario es propietario o administrador
 * @param {ObjectId} idLista
 * @returns {Promise<Audio[]>}
 */
export const getAudiosFromLista = catchAsync(async (req : Request, res : Response) => {
  try {
    const lista = await listasDb.getListaById(parseInt(req.params.idLista));
    if (!lista) {
      res.status(httpStatus.NOT_FOUND).send("Lista no encontrada");
      return;
    }

    if (lista.esPrivada && !await isOwnerOrAdmin(parseInt(req.params.idLista), req.auth?.idUsuario, req.auth?.esAdmin)) {
      res.status(httpStatus.UNAUTHORIZED).send("No tienes permisos para interactuar con esta lista");
      return;
    }

    let audios = await listasDb.getAudiosFromLista(parseInt(req.params.idLista));
    // Devolvemos solo los audios que son públicos o los privados si el usuario es propietario o admin
    let audiosRes: Audio[] = [];

    for (let i = 0; i < audios.length; i++) {
      if (!audios[i].esPrivada || await isOwnerOrAdmin(audios[i].idAudio, req.auth?.idUsuario, req.auth?.esAdmin, true)) {
        audiosRes.push(audios[i]);
      }
    }

    res.send(audiosRes);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});


/**
 * Devuelve los propietarios de una lista si es pública o si el usuario es propietario o administrador
 * @param {ObjectId} idLista
 * @returns {Promise<Number[]>}
 */
export const getPropietariosFromLista = catchAsync(async (req : Request, res : Response) => {
  try {
    const lista = await listasDb.getListaById(parseInt(req.params.idLista));
    if(!lista) {
      res.status(httpStatus.NOT_FOUND).send("Lista no encontrada");
      return;
    }

    if (lista.esPrivada && !await isOwnerOrAdmin(parseInt(req.params.idLista), req.auth?.idUsuario, req.auth?.esAdmin)) {
      res.status(httpStatus.UNAUTHORIZED).send("No tienes permisos para interactuar con esta lista");
      return;
    }

    const propietarios = await listasDb.getPropietariosFromLista(parseInt(req.params.idLista));
    res.send(propietarios);
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});


/**
 * Devuelve los seguidores de una lista si es pública o si el usuario es propietario o administrador
 * @param {ObjectId} idLista
 * @returns {Promise<Number[]>}
 */
export const getSeguidoresFromLista = catchAsync(async (req : Request, res : Response) => {
  try {
    const lista = await listasDb.getListaById(parseInt(req.params.idLista));
    if(!lista) {
      res.status(httpStatus.NOT_FOUND).send("Lista no encontrada");
      return;
    }
    
    if (lista.esPrivada && !await isOwnerOrAdmin(parseInt(req.params.idLista), req.auth?.idUsuario, req.auth?.esAdmin)) {
      res.status(httpStatus.UNAUTHORIZED).send("No tienes permisos para interactuar con esta lista");
      return;
    }

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
    // const idsAudios = await listasDb.getAudiosFromLista(parseInt(req.params.idLista));
    // const idsPropietarios = await listasDb.getPropietariosFromLista(parseInt(req.params.idLista));
    // const idsSeguidores = await sigueListaDb.sigueListaGetListByIdListaPrisma(parseInt(req.params.idLista));
    const lista = await listasDb.getListaByIdWithExtras(parseInt(req.params.idLista));
    if (!lista) {
      res.status(httpStatus.NOT_FOUND).send("Lista no encontrada");
      return;
    }
    
    if (lista.esPrivada && !await isOwnerOrAdmin(parseInt(req.params.idLista), req.auth?.idUsuario, req.auth?.esAdmin)) {
      res.status(httpStatus.UNAUTHORIZED).send("No tienes permisos para interactuar con esta lista");
      return;
    }

    // El usuario recibirá los audios públicos y los privados si es propietario del audio o admin
    // lista.Audios = lista.Audios.filter((audio: { esPrivada: any; idAudio: any }) => 
    //   !audio.esPrivada || isOwnerOrAdmin(audio.idAudio, req.auth?.idUsuario, req.auth?.esAdmin, true));
    
    let audiosRes: Audio[] = [];

    for (let i = 0; i < lista.Audios.length; i++) {
      if (!lista.Audios[i].esPrivada || await isOwnerOrAdmin(lista.Audios[i].idAudio, req.auth?.idUsuario, req.auth?.esAdmin, true)) {
        audiosRes.push(lista.Audios[i]);
      }
    }
    lista.Audios = audiosRes;
    res.send(lista);
        
  } catch (error) {
    // console.log(error);
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
    const lista = await listasDb.getListaById(parseInt(req.params.idLista));
    if(!lista) {
      res.status(httpStatus.NOT_FOUND).send("Lista no encontrada");
      return;
    }

    if (lista.esPrivada && !await isOwnerOrAdmin(parseInt(req.params.idLista), req.auth?.idUsuario, req.auth?.esAdmin)) {
      res.status(httpStatus.UNAUTHORIZED).send("No tienes permisos para interactuar con esta lista");
      return;
    }

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
    const lista = await listasDb.getListaById(parseInt(req.params.idLista));
    if(!lista) {
      res.status(httpStatus.NOT_FOUND).send("Lista no encontrada");
      return;
    }

    // Tienes que poder dejar de seguir una lista aunque no seas propietario o admin así que no se comprueba
    // if (lista.esPrivada && !await isOwnerOrAdmin(parseInt(req.params.idLista), req.auth?.idUsuario, req.auth?.esAdmin)) {
    //   res.status(httpStatus.UNAUTHORIZED).send("No tienes permisos para interactuar con esta lista");
    //   return;
    // }
    
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
    if(!await usuarioDb.usuarioExistPrisma(parseInt(req.params.idUsuario))) {
      res.status(httpStatus.NOT_FOUND).send("Usuario no encontrado");
      return;
    }

    const sigueListas = await sigueListaDb.sigueListaGetListPrisma(parseInt(req.params.idUsuario));
    
    const listas = await Promise.all(sigueListas.map(async (sigueLista) => {
      return await listasDb.getListaById(sigueLista.idLista);
    }));
    
    // Solo se devuelven las listas públicas y las privadas si el usuario es propietario o admin
    listas.filter((lista) => !lista?.esPrivada || isOwnerOrAdmin(lista.idLista, parseInt(req.auth?.idUsuario), req.auth?.esAdmin));
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
    
    if(!await listasDb.getListaById(parseInt(req.params.idLista))) {
      res.status(httpStatus.NOT_FOUND).send("Lista no encontrada");
      return;
    }

    if(!await audioDb.findAudioById(parseInt(req.params.idAudio))) {
      res.status(httpStatus.NOT_FOUND).send("Audio no encontrado");
      return;
    }

    if (!await isOwnerOrAdmin(parseInt(req.params.idLista), req.auth?.idUsuario, req.auth?.esAdmin)) {
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
    // console.log(error);
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
    if(!await listasDb.getListaById(parseInt(req.params.idLista))) {
      res.status(httpStatus.NOT_FOUND).send("Lista no encontrada");
      return;
    }
    
    if(!await audioDb.findAudioById(parseInt(req.params.idAudio))) {
      res.status(httpStatus.NOT_FOUND).send("Audio no encontrado");
      return;
    }

    if (!await isOwnerOrAdmin(parseInt(req.params.idLista), req.auth?.idUsuario, req.auth?.esAdmin)) {
      res.status(httpStatus.UNAUTHORIZED).send("No tienes permisos para añadir un audio a esta lista");
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
    if(!await listasDb.getListaById(parseInt(req.params.idLista))) {
      res.status(httpStatus.NOT_FOUND).send("Lista no encontrada");
      return;
    }

    if(!await usuarioDb.usuarioExistPrisma(parseInt(req.params.idUsuario))) {
      res.status(httpStatus.NOT_FOUND).send("Usuario no encontrado");
      return;
    }

    if (!await isOwnerOrAdmin(parseInt(req.params.idLista), req.auth?.idUsuario, req.auth?.esAdmin)) {
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
    if(!await listasDb.getListaById(parseInt(req.params.idLista))) {
      res.status(httpStatus.NOT_FOUND).send("Lista no encontrada");
      return;
    }

    if(!await usuarioDb.usuarioExistPrisma(parseInt(req.params.idUsuario))) {
      res.status(httpStatus.NOT_FOUND).send("Usuario no encontrado");
      return;
    }

    if (!await isOwnerOrAdmin(parseInt(req.params.idLista), req.auth?.idUsuario, req.auth?.esAdmin)) {
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
export const getListasByPropietario = catchAsync(async (req : Request, res : Response) => {
  try {
    if(!await usuarioDb.usuarioExistPrisma(parseInt(req.params.idUsuario))) {
      res.status(httpStatus.NOT_FOUND).send("Usuario no encontrado");
      return;
    }

    const listas = await listasDb.getListasByPropietario(parseInt(req.params.idUsuario));
    res.send(listas);
  } catch (error) {
    // console.log(error);
    res.status(httpStatus.BAD_REQUEST).send(error);
  }
});


