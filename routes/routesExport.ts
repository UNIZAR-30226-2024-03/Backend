import express from 'express';
import { defaultRouter } from './defaultRoute';
import { listaRouter } from './listaRoutes';
import { audioRouter } from './audioRoutes';

export const routes = express.Router();

routes.use(defaultRouter);
routes.use(listaRouter);
routes.use(audioRouter);