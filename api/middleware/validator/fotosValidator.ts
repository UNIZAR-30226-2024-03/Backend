import { z } from "zod";

export const fotoUploadOneSchema = z.object({});

export const fotoGetSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
