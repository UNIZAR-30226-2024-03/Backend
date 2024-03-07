import express from 'express';
import { defaultRouter } from './defaultRoute';
import { listaRouter } from './listaRoutes';
import { loginRouter } from './loginRoutes';
import { audioRouter } from './audioRoutes';

export const routes = express.Router();

routes.use(defaultRouter);
routes.use(listaRouter);
routes.use(loginRouter);
routes.use(audioRouter);