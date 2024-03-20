import { NextFunction, Response } from "express";

import * as usuarioTypesJs from "../utils/types/usuarioTypes.js";
import { hashPassword } from "../utils/hashContrasegna.js";
import * as usuarioDbJs from "../../db/usuarioDb.js";

export async function usuarioModify(
  req: usuarioTypesJs.ModifyRequest,
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
  req: usuarioTypesJs.GetRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const idUsuario = Number(req.auth?.idUsuario) || req.query.idUsuario;
    const rrss = req.query.rrss;
    const listas = req.query.listas;

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
  req: usuarioTypesJs.FollowRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const idUsuario = Number(req.auth?.idUsuario);
    const idSeguido = req.query.seguido;
    
    if (!(await usuarioDbJs.usuarioExistPrisma(idSeguido)))
      return res.sendStatus(404);

    await usuarioDbJs.usuarioFollowPrisma(idUsuario, idSeguido);
    console.log("Usuario followed");
    return res.sendStatus(201);
  } catch (error) {
    return next(error);
  }
}

export async function usuarioUnfollow(
  req: usuarioTypesJs.UnfollowRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const idUsuario = Number(req.auth?.idUsuario);
    const idSeguido = req.query.seguido;

    if (!(await usuarioDbJs.usuarioExistPrisma(idSeguido)))
      return res.sendStatus(404);

    const usuario = await usuarioDbJs.usuarioUnfollowPrisma(
      idUsuario,
      idSeguido,
    );
    return res.status(201).json({ usuario: usuario });
  } catch (error) {
    return next(error);
  }
}
