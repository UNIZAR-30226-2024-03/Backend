import { type Request } from "express-jwt";
import { ParsedQs } from "qs";

export interface ModifyRequest extends Request {
  body: {
    contrasegna: string;
    imgPerfil: string;
    idUltimoAudio: number;
    segFinAudio: number;
  };
}

export interface GetRequest extends Request {
  query: {
    idUsuario: number;
    rrss: boolean;
    listas: boolean;
  } & ParsedQs;
}

export interface FollowRequest extends Request {
  query: {
    seguido: number;
  } & ParsedQs;
}

export interface UnfollowRequest extends Request {
  query: {
    seguido: number;
  } & ParsedQs;
}
