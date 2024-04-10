import { z } from "zod";

export const usuarioModifySchema = z.object({
  body: z.object({
    contrasegna: z.string().optional(),
    imgPerfil: z.string().uuid().optional(),
    idUltimoAudio: z.coerce.number().int().optional().transform(Number),
    segFinAudio: z.coerce.number().int().optional().transform(Number),
  }),
});

export const usuarioGetSchema = z.object({
  query: z.object({
    idUsuario: z.coerce.number().int().optional().transform(Number),
    listas: z.coerce.boolean().optional().transform(Boolean),
  }),
});

export const usuarioFollowSchema = z.object({
  params: z.object({
    seguido: z.coerce.number().int(),
  }),
});

export const usuarioUnfollowSchema = z.object({
  params: z.object({
    seguido: z.coerce.number().int(),
  }),
});
