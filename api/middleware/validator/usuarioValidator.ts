import { z } from "zod";

export const usuarioModifySchema = z.object({
  body: z.object({
    contrasegna: z.string().optional(),
    imgPerfil: z.string().url().optional(),
    idUltimoAudio: z.coerce.number().int().optional().transform(Number),
    segFinAudio: z.coerce.number().int().optional().transform(Number),
  }),
});

export const usuarioGetSchema = z.object({
  query: z.object({
    idUsuario: z.coerce.number().int().optional().transform(Number),
    rrss: z.coerce.boolean().optional().transform(Boolean),
    listas: z.coerce.boolean().optional().transform(Boolean),
  }),
});

export const usuarioFollowSchema = z.object({
  query: z.object({
    seguido: z.coerce.number().int().transform(Number),
  }),
});

export const usuarioUnfollowSchema = z.object({
  query: z.object({
    seguido: z.coerce.number().int().transform(Number),
  }),
});
