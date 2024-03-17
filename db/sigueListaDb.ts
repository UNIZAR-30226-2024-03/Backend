import { SigueLista } from "@prisma/client";
import prisma from "../prisma/client.js";


/**
 * Función que devuelve si un usuario sigue una lista
 * @param {number} idUsuario
 * @param {number} idLista
 * @returns {Promise<SigueLista | null>}
 */
export async function sigueListaGetPrisma(
  idUsuario: number,
  idLista: number,
): Promise<SigueLista | null> {
    if (!idUsuario || !idLista) return null;
    const sigueLista = await prisma.sigueLista.findFirst({
        where: { idUsuario, idLista },
    });
    return sigueLista;
}


/**
 * Función que crea una relación sigueLista
 * @param {number} idUsuario
 * @param {number} idLista
 * @returns {Promise<SigueLista>}
 * 
 * @throws {Error} 
 */
export async function sigueListaCreatePrisma(
  idUsuario: number,
  idLista: number,
): Promise<SigueLista> {
    if (!idUsuario || !idLista) throw new Error("Provide idUsuario and idLista");
    const sigueLista = await prisma.sigueLista.create({
        data: {
            idUsuario,
            idLista,
        },
    });
    return sigueLista;
}


/**
 * Función que edita una relación sigueLista
 * @param {number} idUsuario
 * @param {number} idLista
 * @param {Date} ultimaEscucha
 * @returns {Promise<SigueLista>}
 */
export async function sigueListaEditPrisma(
  idUsuario: number,
  idLista: number,
  ultimaEscucha: Date,
): Promise<SigueLista> {
    if (!idUsuario || !idLista || !ultimaEscucha) throw new Error("Provide idUsuario, idLista and fechaUltimaEscucha");
    const sigueLista = await prisma.sigueLista.update({
        where: { idUsuario_idLista: { idUsuario, idLista } },
        data: { ultimaEscucha },
    });
    return sigueLista;
}


/**
 * Función que elimina una relación sigueLista
 * @param {number} idUsuario
 * @param {number} idLista
 * @returns {Promise<SigueLista>}
 * 
 * @throws {Error} 
 */
export async function sigueListaDeletePrisma(
  idUsuario: number,
  idLista: number,
): Promise<SigueLista> {
    if (!idUsuario || !idLista) throw new Error("Provide idUsuario and idLista");
    const sigueLista = await prisma.sigueLista.delete({
        where: { idUsuario_idLista: { idUsuario, idLista } },
    });
    return sigueLista;
}


/**
 * Función que devuelve las listas seguidas por un usuario
 * @param {number} idUsuario
 * @returns {Promise<SigueLista[]>}
 */
export async function sigueListaGetListPrisma(
  idUsuario: number,
): Promise<SigueLista[]> {
    if (!idUsuario) return [];
    const sigueListas = await prisma.sigueLista.findMany({
        where: { idUsuario },
    });
    return sigueListas;
}


/**
 * Función que devuelve los seguidores de una lista
 * @param {number} idLista
 * @returns {Promise<SigueLista[]>}
 */
export async function sigueListaGetListByIdListaPrisma(
  idLista: number,
): Promise<SigueLista[]> {
    if (!idLista) return [];
    const sigueListas = await prisma.sigueLista.findMany({
        where: { idLista },
    });
    return sigueListas;
}



