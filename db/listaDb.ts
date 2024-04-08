import { Lista, Prisma, TipoLista } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../prisma/client.js';
import ApiError from '../api/utils/errorHandling/utils/ApiError.js';
// import { encryptPassword } from '../utils/encryption';

/**
 * Crea una lista nueva
 * @param {Object} listaBody
 * @returns {Promise<Lista>}
 */
export const createLista = async (
    nombre: string,
    descripcion: string = '',
    esPrivada: boolean,
    esAlbum: boolean,
    imgLista: string| null = process.env.DEFAULT_PLAYLIST_PICTURE || "",
    tipoLista: TipoLista,
    idCreador: number,
    audios: number[]
): Promise<Lista> => {
    // Permitimos que un usuario tenga varias listas que se llamen igual
    // Esto se debe a que puede añadir un segundo propietario tras crear la lista y que esto 
    // de problemas con el nombre de la lista
  // if (await getListaByName(nombre)) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  // }

  // si el create falla, se lanzará una excepción que se capturará en el controlador
  try {
    return await prisma.lista.create({
      data: {
        nombre,
        esAlbum,
        esPrivada,
        Propietarios: {
            connect: { idUsuario: idCreador }
        },
        descripcion,
        fechaUltimaMod: new Date(), // new Date() devuelve la fecha actual
        imgLista,
        tipoLista,
        Audios: {
          // mapeamos los ids de los audios a un array de objetos con el id
          // para que al pasarlo a connect se seleccionen los audios con esos ids
          connect: audios.map((idAudio) => ({ idAudio })),
        }
      }
    });
  } catch (error) {
    // console.log(error);
    throw error;
  }
};


/**
 * Devuelve la lista con el id dado
 * @param {ObjectId} id
 * @returns {Promise<Lista | null>}
 */
export const getListaById = async (id: number): Promise<Lista | null> => {
  try {
    return prisma.lista.findUnique({
      where: { idLista: id }
    });
  } catch (error) {
    // console.log(error);
    throw error;
  }
}


/**
 * Devuelve la lista incluyendo los audios, propietarios y seguidores
 * @param {ObjectId} id
 * @returns {Promise<Lista | null>}
 */
export const getListaByIdWithExtras = async (id: number): Promise<Lista | null> => {
  try {
    return prisma.lista.findUnique({
      where: { idLista: id },
      include: {
        Audios: true,
        Propietarios: true,
        Seguidores: true
      }
    });
  } catch (error) {
    // console.log(error);
    throw error;
  }
}


/**
 * Devuelve los Audios de una lista
 * @param {ObjectId} idLista
 * @returns {Promise<Audio[]>}
 */
export const getAudiosFromLista = async (idLista: number): Promise<Number[]> => {
  try {
    return prisma.lista.findUnique({
     select: {
        Audios: {
          select: {
            idAudio: true
          }
        }
      },
      where: { idLista }
    }).then((lista) => {
      return lista?.Audios.map((audio) => audio.idAudio) || [];
    }
    );
  } catch (error) {
    // console.log(error);
    throw error;
  }
}


/**
 * Devuelve los seguidores de una lista
 * @param {ObjectId} idLista
 * @returns {Promise<Number>}
 */
export const getPropietariosFromLista = async (idLista: number): Promise<Number[]> => {
  try {
    return prisma.lista.findUnique({
      select: {
        Propietarios: {
          select: {
            idUsuario: true
          }
        }
      },
      where: { idLista }
    }).then((lista) => {
      return lista?.Propietarios.map((usuario) => usuario.idUsuario) || [];
    });
  } catch (error) {
    // console.log(error);
    throw error;
  }
}


/**
 * Devuelve los seguidores de una lista
 * @param {ObjectId} idLista
 * @returns {Promise<Number>}
 */
export const getSeguidoresFromLista = async (idLista: number): Promise<Number[]> => {
  try {
    return prisma.sigueLista.findMany({
      select: {
        idUsuario: true
      },
      where: { idLista }
    }).then((seguidores) => {
      return seguidores.map((seguidor) => seguidor.idUsuario);
    });
  } catch (error) {
    // console.log(error);
    throw error;
  }
}


/**
 * Devuelve las listas de las que un usuario es propietario
 * @param {ObjectId} idUsuario
  * @returns {Promise<Lista[]>}
  */
export const getListasByPropietario = async (idUsuario: number): Promise<Lista[]> => {
  try {
    return prisma.lista.findMany({
      where: { Propietarios: { some: { idUsuario } } }
    });
  } catch (error) {
     console.log(error);
    throw error;
  }
}

/**
 * Edita una lista
 * @param {ObjectId} id
 * @param {Object} updateBody Es un objeto de la forma { nombre, descripcion, esPrivada, imgLista, tipoLista, audios }
 * @returns {Promise<Lista>}
 * @throws {ApiError}
 */
export const updateListaById = async (
  id: number,
  updateBody: Prisma.ListaUpdateInput
): Promise<Lista> => {
  try {
    const lista = await getListaById(id);
    if (!lista) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Lista not found');
    }
    //updateBody.Audios tiene que ser un array de objetos con el id del audio
    // console.log("updateBody: ", updateBody);

    updateBody.fechaUltimaMod = new Date(); // Actualizamos la fecha de última modificación
    return await prisma.lista.update({
      where: { idLista: lista.idLista },
      data: updateBody
    });
  } catch (error) {
    // console.log(error);
    throw error;
  }
};



/**
 * Elimina una lista
 * @param {ObjectId} id
 * @returns {Promise<Lista>}
 * @throws {ApiError}
 */
export const deleteListaById = async (id: number): Promise<Lista> => {
  try {
    return await prisma.lista.delete({
      where: { idLista: id }
    });
  } catch (error) {
    // console.log(error);
    throw error;
  }
}



/**
 * Añade un audio a una lista
 * @param {ObjectId} idLista
 * @param {ObjectId} idAudio
 * @returns {Promise<Lista>}
 * @throws {ApiError}
 */
export const addAudioToLista = async (
  idLista: number,
  idAudio: number
): Promise<Lista> => {
  const lista = await getListaById(idLista);
  // console.log("idAudio: ", idAudio);
  // console.log("idLista: ", idLista);
  // console.log("lista: ", lista);
  if (!lista) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lista not found');
  }
  try {
    return prisma.lista.update({
      where: { idLista: lista.idLista },
      data: {
        Audios: {
          connect: { idAudio }
        }
      }
    });
  } catch (error) {
    // console.log(error);
    throw error;
  }
}


/**
 * Elimina un audio de una lista
 * @param {ObjectId} idLista
 * @param {ObjectId} idAudio
 * @returns {Promise<Lista>}
 * @throws {ApiError}
 */
export const deleteAudioFromLista = async (
  idLista: number,
  idAudio: number
): Promise<Lista> => {
  const lista = await getListaById(idLista);
  if (!lista) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lista not found');
  }
  try {
    return prisma.lista.update({
      where: { idLista: lista.idLista },
      data: {
        Audios: {
          disconnect: { idAudio }
        }
      }
    });
  } catch (error) {
    // console.log(error);
    throw error;
  }
}



/**
 * Añade un usuario como propietario de una lista
 * @param {ObjectId} idLista
 * @param {ObjectId} idUsuario
 * @returns {Promise<Lista>}
 * @throws {ApiError}
 */
export const addPropietarioToLista = async (
  idLista: number,
  idUsuario: number
): Promise<Lista> => {
  const lista = await getListaById(idLista);
  if (!lista) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lista not found');
  }

  try {
    return prisma.lista.update({
      where: { idLista: lista.idLista },
      data: {
        Propietarios: {
          connect: { idUsuario }
        }
      }
    });
  } catch (error) {
    // console.log(error);
    throw error;
  }
}


/**
 * Elimina un usuario como propietario de una lista
 * @param {ObjectId} idLista
 * @param {ObjectId} idUsuario
 * @returns {Promise<Lista>}
 * @throws {ApiError}
 */
export const deletePropietarioFromLista = async (
  idLista: number,
  idUsuario: number
): Promise<Lista> => {
  const lista = await getListaById(idLista);
  if (!lista) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lista not found');
  }

  try {
    return prisma.lista.update({
      where: { idLista: lista.idLista },
      data: {
        Propietarios: {
          disconnect: { idUsuario }
        }
      }
    });
  } catch (error) {
    // console.log(error);
    throw error;
  }
}


