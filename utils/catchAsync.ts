import { RequestHandler } from 'express';
import { Request, Response, NextFunction } from 'express-serve-static-core';


// Tipo de datos para los parámetros de la URL
export interface CustomParamsDictionary {
  [key: string]: any;
}


// Función que recibe un controlador y devuelve un controlador que maneja errores.
const catchAsync =
  (fn: RequestHandler<CustomParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>) =>
  (
    req: Request<CustomParamsDictionary, any, any, any, Record<string, any>>,
    res: Response<any, Record<string, any>, number>,
    next: NextFunction
  ) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };

export default catchAsync;