import { z } from "zod";

export const searchSchema = z.object({
    query: z.object({
        q: z.string(),
        usuario: z.any().optional(),
        lista: z.any().optional(),
        album: z.any().optional(),
        cancion: z.any().optional(),
        podcast: z.any().optional(),
    }),
});