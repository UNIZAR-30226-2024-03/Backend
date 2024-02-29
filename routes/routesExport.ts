import express from 'express';
import { defaultRouter } from './defaultRoute';
import { listaRouter } from './listaRoutes';

export const routes = express.Router();

routes.use(defaultRouter);
routes.use(listaRouter);