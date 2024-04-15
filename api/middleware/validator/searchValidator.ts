import { z } from "zod";

export const searchSchema = z.object({
    query: z.object({
        q: z.string(),
        quieroUsuario: z.coerce.boolean().optional(),
        quieroLista: z.coerce.boolean().optional(),
        quieroAlbum: z.coerce.boolean().optional(),
        quieroCancion: z.coerce.boolean().optional(),
        quieroPodcast: z.coerce.boolean().optional(),
    }),
});