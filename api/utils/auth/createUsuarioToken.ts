import { type Usuario } from "@prisma/client";
import jwt from "jsonwebtoken";

/**
 * Creates a token containing the usuario information for future authorization.
 * @param usuario Usuario information to create the token
 * @returns the token created
 */
export function createUsuarioToken(usuario: Usuario) {
  if (!process.env.JWT_SECRET)
    throw new Error("JWT_SECRET missing in environment.");
  const EXPIRATION = Number(process.env.EXPIRATION) || 60;
  const tokenObject = {
    idUsuario: usuario.idUsuario,
    email: usuario.email,
    expirationDate: new Date(Date.now() + EXPIRATION * 60 * 1000),
  };
  const usuarioJSON = JSON.stringify(tokenObject);
  const token = jwt.sign(usuarioJSON, process.env.JWT_SECRET);
  return token;
}
