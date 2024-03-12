import { NextFunction, Response } from "express";
import { Request } from "express-jwt";

import { hashPassword } from "../utils/hashContrasegna.js";
import * as usuarioDbJs from "../db/usuarioDb.js";

export async function usuarioModify(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const idUsuario = Number(req.auth?.idUsuario);

    const { contrasegna, imgPerfil, idUltimoAudio, segFinAudio } = req.body;
    const hashed = contrasegna === null ? hashPassword(contrasegna) : null;

    const usuario = await usuarioDbJs.usuarioModifyPrisma(
      idUsuario,
      hashed,
      imgPerfil,
      idUltimoAudio,
      segFinAudio,
    );
    return res.status(201).json({ usuario: usuario });
  } catch (error) {
    return next(error);
  }
}

/**
 * Usuario controller that gets the current usuario based on the JWT given.
 * @param req Request with an authenticated usuario on the auth property.
 * @param res Response
 * @param next NextFunction
 * @returns void
 */
export async function usuarioGet(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const idUsuario =
      Number(req.auth?.idUsuario) || Number(req.query.idUsuario);
    const rrss = req.query.rrss === "true";
    const listas = req.query.listas === "true";

    const currentUsuario = await usuarioDbJs.usuarioGetPrisma(
      idUsuario,
      rrss,
      listas,
    );
    if (!currentUsuario) return res.sendStatus(404);
    currentUsuario.contrasegna = null;

    return res.status(200).json({ usuario: currentUsuario });
  } catch (error) {
    return next(error);
  }
}

export async function usuarioFollow(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const idUsuario = Number(req.auth?.idUsuario);
    const idUsuarioSeguido = Number(req.query.idUsuarioSeguido);

    const usuario = await usuarioDbJs.usuarioFollowPrisma(
      idUsuario,
      idUsuarioSeguido,
    );
    return res.status(201).json({ usuario: usuario });
  } catch (error) {
    return next(error);
  }
}

export async function usuarioUnfollow(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const idUsuario = Number(req.auth?.idUsuario);
    const idUsuarioSeguido = Number(req.query.idUsuarioSeguido);

    const usuario = await usuarioDbJs.usuarioUnfollowPrisma(
      idUsuario,
      idUsuarioSeguido,
    );
    return res.status(201).json({ usuario: usuario });
  } catch (error) {
    return next(error);
  }
}
