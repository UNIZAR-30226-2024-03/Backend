import express from 'express';
import { defaultRouter } from './defaultRoute.js';
import { listaRouter } from './listaRoutes.js';
import { audioRouter } from './audioRoutes.js';
import { loginRouter } from './loginRoutes.js';

export const routes = express.Router();

routes.use(defaultRouter);
routes.use(listaRouter);
routes.use(loginRouter);
routes.use(audioRouter);