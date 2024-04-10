import prisma from "../prisma/client.js";


//PRE: Se recibe un id de audio correcto
//POST: Se devuelve el audio con el id correspondiente
export async function findAudioById(id: number) {
    const audioRuta = await prisma.audio.findUnique({
        where: {
            idAudio: id,
        },
    });
    return audioRuta;
}


//PRE: Se recibe un id de audio correcto
//POST: Se elimina el audio con el id correspondiente
export async function deleteAudioById(id: number) {
    await prisma.audio.delete({
        where: {
            idAudio: id,
        },
    });
}

//PRE: Se recibe un id de audio correcto
//POST: Se devuelve el audio con el id correspondiente
export async function createAudioDB(titulo: string, path: string, duracionSeg: number, fechaLanz: string, esAlbum: boolean, esPrivada: boolean, idsUsuarios2: number[],img: string) {
    const audioData = {
        titulo: titulo,
        path: "/audios/"+path,
        duracionSeg: duracionSeg,
        fechaLanz: fechaLanz,
        esAlbum: esAlbum,
        esPrivada: esPrivada,
        imgAudio: img,
        Artistas:{
            connect: idsUsuarios2.map((idUsuario: number) => ({ idUsuario })),
        }
    };
    const audio = await prisma.audio.create({
        data: audioData
    });
    return audio;
}


//PRE: Se recibe un id de audio correcto y un objeto con los campos a modificar, los cuales
//     deben de ser válidos y con el mismo nombre que en la base de datos
//POST: Se actualiza el audio con el id correspondiente
export async function updateAudioById(id: number, audioData: any) {
    await prisma.audio.update({
        where: { idAudio: id },
        data: audioData,
    });
}


//PRE: Se recibe un id de audio correcto
//POST: Se devuelve el audio con el id correspondiente
export async function getArtistaAudioById(id: number) {
    const audio = await prisma.audio.findMany({
        where: {
            idAudio: id,
        },
        include: {
            Artistas: true,
        },
    });
    return audio;
}

//PRE: Se recibe un id de audio correcto y un array de ids de usuarios
//POST: Se añaden los usuarios con los ids correspondientes al audio con el id correspondiente
export async function addPropietariosToAudio(id: number, idUsuarios: number[]) {
    await prisma.audio.update({
        where: { idAudio: id },
        data: {
            Artistas: {
                connect: idUsuarios.map(idUsuario => ({ idUsuario })),
            },
        },
    });
}