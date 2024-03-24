import { SigueLista } from "@prisma/client";
import prisma from "../prisma/client.js";


/**
 * Función que devuelve si un usuario sigue una lista
 * @param {number} idLista
 * @param {number} idUsuario
 * @returns {Promise<SigueLista | null>}
 */
export async function sigueListaGetPrisma(
    idLista: number,
  idUsuario: number,
): Promise<SigueLista | null> {
    if (!idUsuario || !idLista) return null;
    const sigueLista = await prisma.sigueLista.findFirst({
        where: { idUsuario, idLista },
    });
    return sigueLista;
}


/**
 * Función que crea una relación sigueLista
 * @param {number} idLista
 * @param {number} idUsuario
 * @returns {Promise<SigueLista>}
 * 
 * @throws {Error} 
 */
export async function sigueListaCreatePrisma(
    idLista: number,
  idUsuario: number,
): Promise<SigueLista> {
    console.log("idUsuario: ", idUsuario);
    console.log("idLista: ", idLista);
    if (!idUsuario || !idLista) throw new Error("Provide idUsuario and idLista");
   try {
        return await prisma.sigueLista.create({
            data: { idUsuario, idLista },
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
}


/**
 * Función que edita una relación sigueLista
 * @param {number} idLista
 * @param {number} idUsuario
 * @param {Date} ultimaEscucha
 * @returns {Promise<SigueLista>}
 */
export async function sigueListaEditPrisma(
    idLista: number,
  idUsuario: number,
  ultimaEscucha: Date,
): Promise<SigueLista> {
    if (!idUsuario || !idLista || !ultimaEscucha) throw new Error("Provide idUsuario, idLista and fechaUltimaEscucha");
    try {
        return await prisma.sigueLista.update({
            where: { idUsuario_idLista: { idUsuario, idLista } },
            data: { ultimaEscucha },
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
}


/**
 * Función que elimina una relación sigueLista
 * @param {number} idLista
 * @param {number} idUsuario
 * @returns {Promise<SigueLista>}
 * 
 * @throws {Error} 
 */
export async function sigueListaDeletePrisma(
    idLista: number,
  idUsuario: number,
): Promise<SigueLista> {
    if (!idUsuario || !idLista) throw new Error("Provide idUsuario and idLista");
    try {
        return await prisma.sigueLista.delete({
            where: { idUsuario_idLista: { idUsuario, idLista } },
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
}


/**
 * Función que devuelve las listas seguidas por un usuario
 * @param {number} idUsuario
 * @returns {Promise<SigueLista[]>}
 */
export async function sigueListaGetListPrisma(
  idUsuario: number,
): Promise<SigueLista[]> {
    try {
        return await prisma.sigueLista.findMany({
            where: { idUsuario },
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
}


/**
 * Función que devuelve los seguidores de una lista
 * @param {number} idLista
 * @returns {Promise<SigueLista[]>}
 */
export async function sigueListaGetListByIdListaPrisma(
  idLista: number,
): Promise<SigueLista[]> {
    try {
        return await prisma.sigueLista.findMany({
            where: { idLista },
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
}



