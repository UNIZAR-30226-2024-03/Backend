import prisma from "../prisma/client.js";
import * as etiquetasDb from "../db/etiquetasDb.js";

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
export async function createAudioDB(titulo: string, path: string, duracionSeg: number, fechaLanz: string, esAlbum: boolean, esPrivada: boolean, idsUsuarios2: number[],img: string, esPodcast: boolean) {
    const audioData = {
        titulo: titulo,
        path: "/audios/"+path,
        duracionSeg: duracionSeg,
        fechaLanz: fechaLanz,
        esAlbum: esAlbum,
        esPrivada: esPrivada,
        imgAudio: img,
        esPodcast: esPodcast,
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
//POST: Se devuelven los ids de los artistas que han participado en el audio con el id correspondiente en un array
export async function getIdArtistaAudioById(id: number) {
    const audio = await prisma.audio.findMany({
        where: {
            idAudio: id,
        },
        include: {
            Artistas: true,
        },
    });

    const artistas = audio.flatMap((audio) => audio.Artistas.map((artista) => artista.idUsuario));

    return artistas;
}

//PRE: Se recibe un id de audio correcto
//POST: Se devuelven los artistas que han participado en el audio con el id correspondiente en un array
export async function getArtistasAudioById(id: number) {
    const audio = await prisma.audio.findMany({
        where: {
            idAudio: id,
        },
        include: {
            Artistas: true,
        },
    });

    const artistas = audio.flatMap((audio) => audio.Artistas.map((artista) => artista));

    return artistas;
}

export async function addPropietariosToAudio(id: number, idUsuarios: number[]) {
  // Primero, obtén la lista actual de propietarios del audio
  const audio = await prisma.audio.findUnique({
      where: { idAudio: id },
      include: { Artistas: true },
  });
  if (!audio) {
      throw new Error('Audio not found');
  }
  const currentPropietariosIds = audio.Artistas.map(artista => artista.idUsuario);

  // Encuentra los propietarios que necesitan ser desconectados y los que necesitan ser conectados
  const propietariosToDisconnect = currentPropietariosIds.filter(idUsuario => !idUsuarios.includes(idUsuario));
  const propietariosToConnect = idUsuarios.filter(idUsuario => !currentPropietariosIds.includes(idUsuario));

  // Desconecta los propietarios que ya no están en la lista
  for (const idUsuario of propietariosToDisconnect) {
      await prisma.audio.update({
          where: { idAudio: id },
          data: {
              Artistas: {
                  disconnect: [{ idUsuario }],
              },
          },
      });
  }

  // Conecta los nuevos propietarios
  if (propietariosToConnect.length > 0) {
      await prisma.audio.update({
          where: { idAudio: id },
          data: {
              Artistas: {
                  connect: propietariosToConnect.map(idUsuario => ({ idUsuario })),
              },
          },
      });
  }
}

export async function unlinkAllLabelsFromAudio(idAudio: number, tipoEtiqueta: string) {
  const audio = await prisma.audio.findUnique({
    where: { idAudio: idAudio },
    include: { EtiquetasPodcast: true, EtiquetasCancion: true },
  });

  if (audio) {
    if (tipoEtiqueta === 'Podcast') {
      await prisma.audio.update({
        where: { idAudio: idAudio },
        data: {
          EtiquetasPodcast: {
            disconnect: audio.EtiquetasPodcast.map(etiqueta => ({ idEtiqueta: etiqueta.idEtiqueta })),
          },
        },
      });
    } else {
      await prisma.audio.update({
        where: { idAudio: idAudio },
        data: {
          EtiquetasCancion: {
            disconnect: audio.EtiquetasCancion.map(etiqueta => ({ idEtiqueta: etiqueta.idEtiqueta })),
          },
        },
      });
    }
  }
}

export async function linkLabelToAudio(idAudio: number, idLabel: number,tipoEtiqueta: string) {
    if (tipoEtiqueta == 'Podcast') {
        await prisma.audio.update({
            where: { idAudio: idAudio },
            data: {
                EtiquetasPodcast: {
                    connect: { idEtiqueta: idLabel },
                },
            },
        });
        await etiquetasDb.addTagToAudio(idAudio, idLabel, tipoEtiqueta);

    } else if (tipoEtiqueta == 'Cancion'){
        await prisma.audio.update({
            where: { idAudio: idAudio },
            data: {
                EtiquetasCancion: {
                    connect: { idEtiqueta: idLabel },
                },
            },
        });
        await etiquetasDb.addTagToAudio(idAudio, idLabel, tipoEtiqueta);
    }
    
}

export async function unlinkLabelToAudio(idAudio: number, idLabel: number,tipoEtiqueta: string) {
    if (tipoEtiqueta == 'Podcast') {
        await prisma.audio.update({
            where: { idAudio: idAudio },
            data: {
                EtiquetasPodcast: {
                    disconnect: { idEtiqueta: idLabel },
                },
            },
        });
        await etiquetasDb.removeTagFromAudio(idAudio, idLabel, tipoEtiqueta);
    } else if (tipoEtiqueta == 'Cancion'){
        await prisma.audio.update({
            where: { idAudio: idAudio },
            data: {
                EtiquetasCancion: {
                    disconnect: { idEtiqueta: idLabel },
                },
            },
        });
        await etiquetasDb.removeTagFromAudio(idAudio, idLabel, tipoEtiqueta);
    }
}


export async function listenToAudio(userId: number, audioId: number) {
    await prisma.escucha.create({
      data: {
        idUsuario: userId,
        idAudio: audioId,
        fecha: new Date(),
      },
    });
}

export async function getVecesEscuchada(audioId: number) {
    const vecesEscuchada = await prisma.escucha.count({
      where: {
        idAudio: audioId,
      },
    });
    return vecesEscuchada;
}

export async function getAudioStats(audioId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1); // JavaScript months are 0-indexed
    const endDate = new Date();
    const stats = [];
  
    for (let date = startDate; date <= endDate; date.setMonth(date.getMonth() + 1)) {
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed
      const year = date.getFullYear();
  
      const listens = await prisma.escucha.count({
        where: {
          idAudio: audioId,
          fecha: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month % 12, 1), // First day of the next month
          },
        },
      });
  
      stats.push({ month, year, listens });
    }
  
    return stats;
  }


export async function getLastUploadedAudios() {
  const cancion = await prisma.audio.findMany({
    where: {
      esPodcast: false,
    },
    orderBy: {
      fechaLanz: 'desc',
    },
    include: {
      Artistas: {
        select: {
          idUsuario: true,
          nombreUsuario: true,
        },
      },
    },
    take: 10,
  });
  
  const podcast = await prisma.audio.findMany({
    where: {
      esPodcast: true,
    },
    orderBy: {
      fechaLanz: 'desc',
    },
    include: {
      Artistas: {
        select: {
          idUsuario: true,
          nombreUsuario: true,
        },
      },
    },
    take: 10,
  });
  
  const cancionConArtistasEnMinuscula = cancion.map(audio => {
    const { Artistas, ...restoAudio } = audio;
    return {
      ...restoAudio,
      artistas: Artistas,
    };
  });
  
  const podcastConArtistasEnMinuscula = podcast.map(audio => {
    const { Artistas, ...restoAudio } = audio;
    return {
      ...restoAudio,
      artistas: Artistas,
    };
  });
  
  return { cancion: cancionConArtistasEnMinuscula, podcast: podcastConArtistasEnMinuscula };
}

export async function getMostListenedAudios() {
    const audios = await prisma.escucha.groupBy({
      by: ['idAudio'],
      where: {
        Audio: {
          esPodcast: false
        }
      },
      _count: {
        idAudio: true
      },
      orderBy: {
        _count: {
          idAudio: 'desc'
        }
      },
      take: 10
    });
  
    const podcasts = await prisma.escucha.groupBy({
      by: ['idAudio'],
      where: {
        Audio: {
          esPodcast: true
        }
      },
      _count: {
        idAudio: true
      },
      orderBy: {
        _count: {
          idAudio: 'desc'
        }
      },
      take: 10
    });
  
    const audio = audios.map(a => ({
      count: a._count.idAudio,
      idAudio: a.idAudio
    }));
  
    const podcast = podcasts.map(p => ({
      count: p._count.idAudio,
      idAudio: p.idAudio
    }));
  
    return { audio, podcast };
  }


  export async function getNRandomAudios(n: number) {
    const totalAudios = await prisma.audio.count();
    const randomSeed = Math.floor(Math.random() * totalAudios);

    if (n > totalAudios) {
      throw new Error('Not enough audios in the database');
    }

    const audios = await prisma.audio.findMany({
      where: {
      esPrivada: false,
      },
      skip: randomSeed,
      take: n,
      include: {
        Artistas: {
          select: {
          idUsuario: true,
          nombreUsuario: true,
          }
      }
      },
    });


    return audios;

  }