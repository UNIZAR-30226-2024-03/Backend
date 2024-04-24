import { Usuario } from "@prisma/client";
import prisma from "../prisma/client.js";

export async function usuarioExistPrisma(
  idUsuario: number | null = null,
  email: string | null = null,
  nombreUsuario: string | null = null,
): Promise<boolean> {
  if (!idUsuario && !email && !nombreUsuario)
    throw new Error("Provide at least one parameter");

  // {} idUsuario: 1, email: null, nombreUsuario: 'John' } -> { idUsuario: 1, nombreUsuario: 'John' }
  const conditions = { idUsuario, email, nombreUsuario };
  const query = Object.entries(conditions)
    .filter(([, value]) => value !== null)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  const usuario = await prisma.usuario.findFirst({
    where: query,
  });

  return Boolean(usuario);
}

export async function usuarioGetPrisma(
  idUsuario: number,
  rrss: boolean = false,
  listas: boolean = false,
): Promise<any | null> {
  if (!idUsuario) return null;
  const usuario: any = await prisma.usuario.findUnique({
    where: { idUsuario: idUsuario },
    include: {
      Seguidores: rrss,
      Seguidos: rrss,
      Listas: listas,
      // ListasPropias: listas,
    },
  });

  if (rrss && usuario) {
    usuario.Seguidores = usuario.Seguidores.map((seguidor: any) => {
      return seguidor.seguidorId;
    });

    usuario.Seguidos = usuario.Seguidos.map((seguido: any) => {
      return seguido.seguidoId;
    });
  }

  return usuario;
}

export async function usuarioCountSeguidoresAndSeguidos(
  idUsuario: number,
): Promise<Array<number>> {
  const [seguidores, seguidos] = await Promise.all([
    prisma.seguir.count({
      where: { seguidoId: idUsuario },
    }),
    prisma.seguir.count({
      where: { seguidorId: idUsuario },
    }),
  ]);

  return [seguidores, seguidos];
}

export async function usuarioGetEmailPrisma(
  email: string,
  rrss: boolean = false,
  listas: boolean = false,
): Promise<Usuario | null> {
  if (!email) return null;
  const usuario = await prisma.usuario.findUnique({
    where: { email: email },
    include: {
      Seguidores: rrss,
      Seguidos: rrss,
      Listas: listas,
      // ListasPropias: listas,
    },
  });
  return usuario;
}

export async function usuarioCreatePrisma(
  nombreUsuario: string,
  email: string,
  contrasegna: string | null,
  imgPerfil: string | null = process.env.DEFAULT_USER_PICTURE || "",
) {
  const usuario = await prisma.usuario.create({
    data: { nombreUsuario, email, contrasegna, imgPerfil },
  });
  return usuario;
}

export async function usuarioModifyPrisma(
  idUsuario: number,
  contrasegna: string | null,
  imgPerfil: string | null,
  idUltimoAudio: number | null,
  segFinAudio: number | null,
): Promise<Usuario | null> {
  let data = {};
  if (contrasegna) data = { ...data, contrasegna };
  if (imgPerfil) data = { ...data, imgPerfil };
  if (idUltimoAudio) data = { ...data, idUltimoAudio };
  if (segFinAudio) data = { ...data, segFinAudio };
  
  const usuario = await prisma.usuario.update({
    where: { idUsuario: idUsuario },
    data: data,
  });
  return usuario;
}

export async function usuarioFollowPrisma(
  idUsuario: number,
  idUsuarioSeguido: number,
): Promise<void> {
  await prisma.seguir.create({
    data: {
      seguidorId: idUsuario,
      seguidoId: idUsuarioSeguido,
    },
  });
}

export async function usuarioUnfollowPrisma(
  idUsuario: number,
  idSeguido: number,
): Promise<void> {
  await prisma.seguir.deleteMany({
    where: {
      seguidorId: idUsuario,
      seguidoId: idSeguido,
    },
  });
}

export async function usuarioDeleteEmailPrisma(email: string): Promise<void> {
  await prisma.usuario.delete({
    where: { email: email },
  });
}

export async function usuarioModifyLastAudioPrisma(idUsuario: number,idUltimoAudio: number,segFinAudio: number): Promise<void> {
  await prisma.usuario.update({
    where: { idUsuario: idUsuario },
    data: { 
      idUltimoAudio: idUltimoAudio,
      segFinAudio: segFinAudio },
  });
}


export async function usuarioGetAudios(userId: number, cancion: boolean, podcast: boolean, privada: boolean) {
  let where = {};
  if (!privada) {
      where = {...where, esPrivada: false};
  }
  if (cancion && !podcast) {
      where = {...where, esPodcast: false};
  } else if (!cancion && podcast) {
      where = {...where, esPodcast: true};
  }
  const audios = await prisma.audio.findMany({
    where: {
      ...where,
      Artistas: {
          some: {
              idUsuario: userId,
          },
      },
    },
    include: {
      Artistas: {
          select: {
              idUsuario: true,
              nombreUsuario: true,
          },
      },
    },
  });

  const audiosWithCount = await Promise.all(audios.map(async (audio) => {
    const vecesEscuchada = await prisma.escucha.count({
      where: {
        idAudio: audio.idAudio,
      },
    });
    return { ...audio, vecesEscuchada };
  }));

  const dividedAudios = audiosWithCount.reduce<{ cancion: typeof audiosWithCount; podcast: typeof audiosWithCount }>((acc, lista) => {
    if (lista.esPodcast) {
      acc.podcast.push(lista);
    } else {
      acc.cancion.push(lista);
    }
    return acc;
  }, { cancion: [], podcast: [] });

  return dividedAudios;
}

export async function usuarioGetLastAudiosAndPodcasts(userId: number, numberAudios: number) {
  const cancion = await prisma.escucha.findMany({
    where: {
      idUsuario: userId,
      Audio: {
        esPodcast: false
      }
    },
    orderBy: {
      fecha: 'desc'
    },
    take: numberAudios,
    include: {
      Audio: true
    }
  });

  const podcast = await prisma.escucha.findMany({
    where: {
      idUsuario: userId,
      Audio: {
        esPodcast: true
      }
    },
    orderBy: {
      fecha: 'desc'
    },
    take: numberAudios,
    include: {
      Audio: true
    }
  });

  return { cancion, podcast };
}

export async function usuarioGetNEscuchas(userId: number) {
  const nEscuchas = await prisma.escucha.count({
    where: {
      idUsuario: userId,
    },
  });

  return nEscuchas;
}

export async function usuarioGetOyentesMensuales(userId: number) {
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() - 1);
  const oyentesMensuales = await prisma.escucha.count({
    where: {
      idUsuario: userId,
      fecha: {
        gte: fecha,
      },
    },
  });

  return oyentesMensuales;
}

export async function usuarioGetTopAudios(userId: number, numberAudios: number) {
  // Obtén todos los audios del usuario
  const userAudios = await prisma.audio.findMany({
    where: {
      Artistas: {
        some: {
          idUsuario: userId,
        },
      },
    },
    include: {
      Artistas: {
        select: {
          idUsuario: true,
          nombreUsuario: true,
        },
      },
    },
  });

  // Obtener el recuento de escuchas para cada audio
  const audioCounts = await prisma.escucha.groupBy({
    by: ['idAudio'],
    _count: {
      _all: true,
    },
  });

  // Asigna el recuento de escuchas a cada audio
  const audiosWithCount = userAudios.map(audio => ({
    ...audio,
    count: audioCounts.find(count => count.idAudio === audio.idAudio)?._count._all ?? 0,
  }));

  // Ordena los audios por el recuento en orden descendente
  audiosWithCount.sort((a, b) => b.count - a.count);

  // Toma los primeros 'numberAudios'
  const topAudios = audiosWithCount.slice(0, numberAudios);

  // Cambia la clave 'Artistas' a 'artistas' en los detalles del audio
  const topAudiosWithArtistas = topAudios.map(audio => ({
    ...audio,
    artistas: audio.Artistas,
    Artistas: undefined,
  }));

  return topAudiosWithArtistas;
}

export async function usuarioGetUltimoLanzamiento(userId: number) {
  const audio = await prisma.audio.findFirst({
    where: {
      Artistas: {
        some: {
          idUsuario: userId,
        },
      },
    },
    orderBy: {
      fechaLanz: 'desc',
    },
  });

  return audio;
}