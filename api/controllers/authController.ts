import { NextFunction, Response } from "express";
import { Request } from "express-jwt";

import * as usuarioDbJs from "../../db/usuarioDb.js";
import { compareWithHash, hashPassword } from "../utils/hashContrasegna.js";
import { createUsuarioToken } from "../utils/auth/createUsuarioToken.js";
import { verify } from "../utils/auth/googleVerification.js";

export async function authGoogleLogin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const payload = await verify(req.params.credential);
    if (!payload) return res.sendStatus(401);

    const { email, name } = payload;

    if (!email) return res.sendStatus(401);
    const usuario = await usuarioDbJs.usuarioGetEmailPrisma(email);
    if (usuario) {
      const token = createUsuarioToken(usuario);
      return res.status(200).send(token);
    } else {
      const nombreUsuario = name || email.split("@")[0];
      const usuario = await usuarioDbJs.usuarioCreatePrisma(
        nombreUsuario,
        email,
        null,
      );

      const token = createUsuarioToken(usuario);
      return res.status(201).send(token);
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que registra un usuario desde el formulario de registro con contraseña local.
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns
 */
export async function authSignup(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { email, contrasegna, nombreUsuario } = req.body;
  try {
    const hashed = hashPassword(contrasegna);
    const usuario = await usuarioDbJs.usuarioCreatePrisma(
      nombreUsuario,
      email,
      hashed,
    );

    const token = createUsuarioToken(usuario);
    return res.status(201).send(token);
  } catch (error) {
    return next(error);
  }
}

export async function authLogin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, contrasegna } = req.body;
    const usuario = await usuarioDbJs.usuarioGetEmailPrisma(email);
    if (!usuario) return res.sendStatus(404);

    if (!usuario.contrasegna)
      return res.status(401).send("Usuario se registro con google.");
    if (!compareWithHash(contrasegna, usuario.contrasegna))
      return res.status(401).send("Contraseña incorrecta.");

    const token = createUsuarioToken(usuario);
    return res.status(200).send(token);
  } catch (error) {
    return next(error);
  }
}
