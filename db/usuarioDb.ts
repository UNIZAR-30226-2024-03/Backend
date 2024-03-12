import { Usuario } from "@prisma/client";
import prisma from "../prisma/client.js";

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
      ListasPropias: listas,
    },
  });
  return usuario;
}

export async function usuarioGetEmailPrisma(
  email: string,
  rrss: boolean = false,
  listas: boolean = false,
): Promise<Usuario | null> {
  console.log(email);
  if (!email) return null;
  const usuario = await prisma.usuario.findUnique({
    where: { email: email },
    include: {
      Seguidores: rrss,
      Seguidos: rrss,
      Listas: listas,
      ListasPropias: listas,
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
  const usuario = await prisma.usuario.update({
    where: { idUsuario: idUsuario },
    data: { contrasegna, imgPerfil, idUltimoAudio, segFinAudio },
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
    include: {
      seguidor: true,
      seguido: true
    },
  });
}

export async function usuarioUnfollowPrisma(
  idUsuario: number,
  idUsuarioSeguido: number,
): Promise<void> {
  await prisma.seguir.deleteMany({
    where: {
      seguidorId: idUsuario,
      seguidoId: idUsuarioSeguido,
    },
  });
}
