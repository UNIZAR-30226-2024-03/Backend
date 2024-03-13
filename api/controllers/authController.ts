import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { google } from "googleapis";

import * as usuarioDbJs from "../../db/usuarioDb.js";
import { compareWithHash, hashPassword } from "../utils/hashContrasegna.js";
import { createUsuarioToken } from "../utils/auth/createUsuarioToken.js";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google",
);
const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });

export async function authGoogleLogin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const code = req.query.code as string;
    if (!code) return res.sendStatus(400);

    // Exchange the authorization code for an access token
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const { data } = await oauth2.userinfo.get();
    const { email, name, picture } = data;

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
        picture,
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
