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
    esAlbum: boolean,
    esPrivada: boolean,
    idCreador: number,
    descripcion: string = '',
    imgLista: string| null = process.env.DEFAULT_PLAYLIST_PICTURE || "",
    tipoLista: TipoLista,
    audios: number[]
): Promise<Lista> => {
    // Permitimos que un usuario tenga varias listas que se llamen igual
    // Esto se debe a que puede añadir un segundo propietario tras crear la lista y que esto 
    // de problemas con el nombre de la lista
  // if (await getListaByName(nombre)) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  // }
  return prisma.lista.create({
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
};


/**
 * Devuelve la lista con el id dado
 * @param {ObjectId} id
 * @returns {Promise<Lista | null>}
 */
export const getListaById = async (id: number): Promise<Lista | null> => {
  return prisma.lista.findUnique({
    where: { idLista: id }
  });
}


/**
 * Edita una lista
 * @param {ObjectId} id
 * @param {Object} updateBody Es un objeto de la forma
 * @returns {Promise<Lista>}
 * @throws {ApiError}
 */
export const updateListaById = async (
  id: number,
  updateBody: Prisma.ListaUpdateInput
): Promise<Lista> => {
  const lista = await getListaById(id);
  if (!lista) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lista not found');
  }
  return prisma.lista.update({
    where: { idLista: lista.idLista },
    data: updateBody
  });
};



/**
 * Elimina una lista
 * @param {ObjectId} id
 * @returns {Promise<Lista>}
 * @throws {ApiError}
 */
export const deleteListaById = async (id: number): Promise<Lista> => {
  const lista = await getListaById(id);
  if (!lista) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lista not found');
  }
  await prisma.lista.delete({ where: { idLista: lista.idLista } });
  return lista;
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
  if (!lista) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lista not found');
  }

  return prisma.lista.update({
    where: { idLista: lista.idLista },
    data: {
      Audios: {
        connect: { idAudio }
      }
    }
  });
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

  return prisma.lista.update({
    where: { idLista: lista.idLista },
    data: {
      Audios: {
        // disconnect lo que hace es eliminar la relación entre el audio y la lista
        // es decir, que el objeto Lista no tendrá el audio en su array de audios
        disconnect: { idAudio }
      }
    }
  });
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

  return prisma.lista.update({
    where: { idLista: lista.idLista },
    data: {
      Propietarios: {
        connect: { idUsuario }
      }
    }
  });
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

  return prisma.lista.update({
    where: { idLista: lista.idLista },
    data: {
      Propietarios: {
        disconnect: { idUsuario }
      }
    }
  });
}



