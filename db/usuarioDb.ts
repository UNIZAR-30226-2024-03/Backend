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
): Promise<Usuario | null> {
  if (!idUsuario) return null;
  const usuario = await prisma.usuario.findUnique({
    where: { idUsuario: idUsuario },
    include: {
      Seguidores: rrss,
      Seguidos: rrss,
      Listas: listas,
      // ListasPropias: listas,
    },
  });
  return usuario;
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