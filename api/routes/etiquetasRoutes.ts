import { Router } from "express";

import * as auth from "../middleware/authenticator.js";
import * as etiquetas from "../controllers/etiquetasController.js";
import { validate } from "../middleware/validator/index.js";

const router = Router();


router.get(
  "/",
  auth.authenticate,
  etiquetas.all,
);

router.get(
    "/cancion/",
    auth.authenticate,
    etiquetas.songs,
);

router.get(
    "/podcast/",
    auth.authenticate,
    etiquetas.podcast,
);

export default router;
