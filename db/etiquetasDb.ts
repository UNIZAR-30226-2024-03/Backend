import { Usuario } from "@prisma/client";
import prisma from "../prisma/client.js";

// PRE: Verdad
// POST: Devuelve todas las etiquetas de canciones
export async function songsTags (): Promise<any> {
  try {
    const allEtiquetasCancion: any = await prisma.etiquetaCancion.findMany();
    return allEtiquetasCancion;
  } catch (error) {
    console.error(error);
    throw new Error("Error obteniendo etiquetas de Canciones desde Base de Datos");
  }
}

// PRE: Verdad
// POST: Devuelve todas las etiquetas de podcast
export async function podcastTags (): Promise<any> {
    try {
      const allEtiquetasPodcast: any = await prisma.etiquetaPodcast.findMany();
      return allEtiquetasPodcast;
    } catch (error) {
      console.error(error);
      throw new Error("Error obteniendo etiquetas de Podcast desde Base de Datos");
    }
}
// PRE: Verdad
// POST: Devuelve todas las etiquetas que tiene el Audio con id <id>
export async function tagsOfAudio (id: number): Promise<any> {
  try {
    const audio = await prisma.audio.findUnique({
      where: {
        idAudio: id,
      },
      include: {
        EtiquetasCancion: true,
        EtiquetasPodcast: true,
      },
    });

    if (!audio) {
      throw new Error("Audio no encontrado!");
    }

    // Filtramos las etiquetas que no sean null
    const etiquetas = audio.EtiquetasCancion ? audio.EtiquetasCancion : audio.EtiquetasPodcast;

    return etiquetas;
  } catch (error) {
    console.error(error);
    throw new Error("Error obteniendo etiquetas de Audio desde Base de Datos");
  }
}


export async function addTagToAudio(idAudio: number, idLabel: number, tipoEtiqueta: string) {

  try {
    if (tipoEtiqueta == 'Podcast') {
      await prisma.etiquetaPodcast.update({
        where: { idEtiqueta: idLabel },
        data: {
          Audios: {
            connect: { idAudio: idAudio },
          },
        },
      });
    } else if (tipoEtiqueta == 'Cancion') {
      await prisma.etiquetaCancion.update({
        where: { idEtiqueta: idLabel },
        data: {
          Audios: {
            connect: { idAudio: idAudio },
          },
        },
      });
    }
  } catch (error) {
    console.error(error);
    throw new Error("Error conectando etiqueta a Audio en Base de Datos");
  }
}


export async function removeTagFromAudio(idAudio: number, idLabel: number, tipoEtiqueta: string) {
  
  try {
    if (tipoEtiqueta == 'Podcast') {
      await prisma.etiquetaPodcast.update({
        where: { idEtiqueta: idLabel },
        data: {
          Audios: {
            disconnect: { idAudio: idAudio },
          },
        },
      });
    } else if (tipoEtiqueta == 'Cancion') {
      await prisma.etiquetaCancion.update({
        where: { idEtiqueta: idLabel },
        data: {
          Audios: {
            disconnect: { idAudio: idAudio },
          },
        },
      });
    }
  } catch (error) { 
    console.error(error);
    throw new Error("Error desconectando etiqueta de Audio en Base de Datos");
  }
}

export async function createTagSong (name: string): Promise<number> {
  try {
    const tag = await prisma.etiquetaCancion.create({
      data: {
        nombre: name,
      },
    });

    return tag.idEtiqueta;
  } catch (error) { 
    console.error(error);
    throw new Error("Error creando etiqueta de Canción en Base de Datos");
  }
}

export async function createTagPodcast (name: string): Promise<number> {
  try {
    const tag = await prisma.etiquetaPodcast.create({
      data: {
        nombre: name,
      },
    });

    return tag.idEtiqueta;
  } catch (error) { 
    console.error(error);
    throw new Error("Error creando etiqueta de Podcast en Base de Datos");
  }
}

export async function existsTag (id: number): Promise<boolean> {
  try {
    const tagCancion = await prisma.etiquetaCancion.findUnique({
      where: {
        idEtiqueta: id,
      },
    });

    if (tagCancion) {
      return true;
    } 

    // Si la etiqueta no se encontró en EtiquetaCancion, intenta buscarla en EtiquetaPodcast
    const tagPodcast = await prisma.etiquetaPodcast.findFirst({
      where: {
        idEtiqueta: id,
      },
    });

    if (tagPodcast) {
      return true;
    }

    return false;
  } catch (error) {
    console.error(error);
    throw new Error("Error buscando la etiqueta en Base de Datos");
  }
}

export async function existsTagByName (name: string): Promise<boolean> {
  try {
    const tagCancion = await prisma.etiquetaCancion.findFirst({
      where: {
        nombre: name,
      },
    });

    if (tagCancion) {
      return true;
    } 

    // Si la etiqueta no se encontró en EtiquetaCancion, intenta buscarla en EtiquetaPodcast
    const tagPodcast = await prisma.etiquetaPodcast.findFirst({
      where: {
        nombre: name,
      },
    });

    if (tagPodcast) {
      return true;
    }

    return false;
  } catch (error) {
    console.error(error);
    throw new Error("Error buscando la etiqueta en Base de Datos");
  }
}


// Devuelve la lista con los nombres de las etiquetas de las últimas nEscuchas del usuario
export async function tagsNLastListened(userId: number, nEscuchas: number) {
  // console.log("userId: ", userId);
  // console.log("nEscuchas: ", nEscuchas);
  const escuchas = await prisma.escucha.findMany({
    where: {
      idUsuario: userId,
    },
    orderBy: {
      fecha: 'desc',
    },
    take: nEscuchas,
    include: {
      Audio: {
        include: {
          EtiquetasCancion: true,
          EtiquetasPodcast: true,
        },
      },
    },
  });
  //  escuchas = {idEscucha, fecha, Audio: {idAudio, nombre, EtiquetasCancion: [{idEtiqueta, nombre}], EtiquetasPodcast: [{idEtiqueta, nombre}]}
  const tags = escuchas.flatMap(escucha => {
    const etiquetas = escucha.Audio.EtiquetasCancion || escucha.Audio.EtiquetasPodcast;
    // console.log("Audio: ", escucha.Audio.idAudio, " Etiquetas: ", etiquetas);
    return etiquetas.map(etiqueta => etiqueta.nombre);
  }).filter((tag, index, self) => self.indexOf(tag) === index);

  return tags;
}

// Devuelve numAudios audios aleatorios que contengan las etiquetas
export async function getNAudiosByTags(numAudios: number, tags: string[]) {
  const audios = await prisma.audio.findMany({
    where: {
      OR: [
        {
          EtiquetasCancion: {
            some: {
              nombre: {
                in: tags,
              },
            },
          },
        },
        {
          EtiquetasPodcast: {
            some: {
              nombre: {
                in: tags,
              },
            },
          },
        },
      ],
      esPrivada: false,
    },
  });
  
  let res = [];
  for(let i = 0; i < numAudios; i++) {
    res.push(audios[Math.floor(Math.random() * audios.length)]);
  }


  return res;
}
