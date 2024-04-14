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

async function searchListas(query: string, lista: boolean, album: boolean)
: Promise<{ listas: Partial<Lista>[]; albums: Partial<Lista>[] }> {
    const where = []
    where.push({ nombre: { contains: query } })
    if (lista && !album) {
        where.push({ esAlbum: false })
    } else if (!lista && album) {
        where.push({ esAlbum: true })
    }

    const res = await prisma.lista.findMany({
        where: {
            AND: where
        },
        select: {
            idLista: true,
            nombre: true,
            esAlbum: true,
            imgLista: true,
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

async function searchAudios (query: string, cancion: boolean, podcast: boolean)
: Promise<{ canciones: Partial<Audio>[]; podcasts: Partial<Audio>[] }> {
    const where = []
    where.push({ titulo: { contains: query } })
    if (cancion && !podcast) {
        where.push({ esAlbum: false })
    } else if (!cancion && podcast) {
        where.push({ esAlbum: true })
    }

    const res = await prisma.audio.findMany({
        where: {
            AND: where
        },
        select: {
            idAudio: true,
            titulo: true,
            esAlbum: true,
            imgAudio: true,
        },
        take: MAX_TAKE,
    });
    const dividedAudios = res.reduce<{ canciones: typeof res; podcasts: typeof res }>((acc, audio) => {
        if (audio.esAlbum) {
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
    quieroUsuario: boolean, 
    quieroLista: boolean,
    quieroAlbum: boolean,
    quieroCancion: boolean,
    quieroPodcast: boolean,
): Promise<any> {
    try {
        const [usuarios, listas, audios] = await Promise.all([
            quieroUsuario ? searchUsuarios(query) : Promise.resolve([]),
            quieroLista || quieroAlbum ? searchListas(query, quieroLista, quieroAlbum) : Promise.resolve([]),
            quieroCancion || quieroPodcast ? searchAudios(query, quieroCancion, quieroPodcast) : Promise.resolve([]),
        ]);
        return { ...usuarios, ...listas, ...audios };

    } catch (error) {
        console.log("error in searchInDb", error);
        throw error;
    }
}
