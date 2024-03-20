import { z } from "zod";

export const authSignupSchema = z.object({
  body: z.object({
    contrasegna: z.string(),
    email: z.string().email(),
    nombreUsuario: z.string(),
  }),
});

export const authLoginSchema = z.object({
  body: z.object({
    contrasegna: z.string(),
    email: z.string().email(),
  }),
});

export const authGoogleSchema = z.object({
  params: z.object({
    credential: z.string(),
  }),
});
