import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

/**
 * Middleware that handles errors generated by Zod validation.
 * @param err Error
 * @param _req Request
 * @param res Response
 * @param next NextFunction
 */
export default async function zodErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!(err instanceof ZodError)) return next(err);

  console.debug(`Handling Zod error: ${err.message}`);

  // Zod errors can contain multiple validation errors
  const validationErrors = err.errors.map((error) => error.message);

  // Send a response with the validation errors
  return res.status(400).json({ errors: validationErrors });
}