import { Usuario, Lista, Audio } from "@prisma/client";
import prisma from "../prisma/client.js";

const MAX_TAKE = 10;

async function searchUsuarios(query: string)
: Promise<{ usuarios: Partial<Usuario>[] }> {
    const res = await prisma.usuario.findMany({
        where: {
            nombreUsuario: { contains: query },
        },
        select: {
            idUsuario: true,
            nombreUsuario: true,
            imgPerfil: true,
        },
        take: MAX_TAKE,
    });
    return { usuarios: res };
};

async function searchListas(idUsuarioQuery: number, query: string, lista: boolean, album: boolean)
: Promise<{ listas: Partial<Lista>[]; albums: Partial<Lista>[] }> {
    const where = []
    where.push({ nombre: { contains: query } })
    where.push({ OR: [
        { esPrivada: false }, 
        { Propietarios: { 
            some: { 
                idUsuario: idUsuarioQuery
            } 
        } }
    ] });
    if (lista && !album) {
        where.push({ esAlbum: false })
    } else if (!lista && album) {
        where.push({ esAlbum: true })
    }

    const res = await prisma.lista.findMany({
        where: {
            AND: where
        },
        take: MAX_TAKE,
    });

    const dividedListas = res.reduce<{ listas: typeof res; albums: typeof res }>((acc, lista) => {
        if (lista.esAlbum) {
            acc.albums.push(lista);
        } else {
            acc.listas.push(lista);
        }
        return acc;
    }, { listas: [], albums: [] });

    return dividedListas;
};

async function searchAudios (idUsuarioQuery: number, query: string, cancion: boolean, podcast: boolean)
: Promise<{ canciones: Partial<Audio>[]; podcasts: Partial<Audio>[] }> {
    const where = []
    where.push({ titulo: { contains: query } })
    where.push({ OR: [
        { esPrivada: false }, 
        { Artistas: { 
            some: { 
                idUsuario: idUsuarioQuery
            } 
        } }
    ] });
    if (cancion && !podcast) {
        where.push({ esPodcast: false })
    } else if (!cancion && podcast) {
        where.push({ esPodcast: true })
    }

    const res = await prisma.audio.findMany({
        where: {
            AND: where
        },
        take: MAX_TAKE,
    });
    const dividedAudios = res.reduce<{ canciones: typeof res; podcasts: typeof res }>((acc, audio) => {
        if (audio.esPodcast) {
            acc.podcasts.push(audio);
        } else {
            acc.canciones.push(audio);
        }
        return acc;
    }, { canciones: [], podcasts: [] });
    
    return dividedAudios;
}

export async function searchInDb(
    query: string, 
    idUsuario: number,
    usuario: boolean, 
    lista: boolean,
    album: boolean,
    cancion: boolean,
    podcast: boolean,
): Promise<any> {
    try {
        const [usuarios, listas, audios] = await Promise.all([
            usuario ? searchUsuarios(query) : Promise.resolve({ usuarios: [] }),
            lista || album ? searchListas(idUsuario, query, lista, album) : Promise.resolve( { listas: [], albums: [] }),
            cancion || podcast ? searchAudios(idUsuario, query, cancion, podcast) : Promise.resolve( { canciones: [], podcasts: [] }),
        ]);
        return { ...usuarios, ...listas, ...audios };

    } catch (error) {
        console.log("error in searchInDb", error);
        throw error;
    }
}
