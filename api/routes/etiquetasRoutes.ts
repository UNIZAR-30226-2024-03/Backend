<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream:api/routes/etiquetasRoutes.ts
>>>>>>> Stashed changes
import { Router } from "express";

import * as auth from "../middleware/authenticator.js";
import * as etiquetas from "../controllers/etiquetasController.js";
import { validate } from "../middleware/validator/index.js";

const router = Router();


router.get(
  "/etiquetas/",
  auth.authenticate,
  etiquetas.all,
);

router.get(
    "/etiquetas/cancion/",
    auth.authenticate,
    etiquetas.songs,
);

router.get(
    "/etiquetas/podcast/",
    auth.authenticate,
    etiquetas.podcast,
);

<<<<<<< Updated upstream
export default router;
=======
export default router;
=======
import express, { Express, Request, Response } from "express";

//elemento prisma para acceder a la base de datos declarado en el archivo index.ts de la carpeta prisma
import prisma  from "../prisma/index.js";

export const etiquetasRouter = express.Router();

// PRE: Verdad
// POST: Devuelve en un JSON todas las etiquetas de la base de datos
etiquetasRouter.get('/etiquetas/', async function(req: Request, res: Response) {
    try {
        // Consulto todas las etiquetas de los podcasts y las canciones
        const etiquetasPodcast = await prisma.etiquetaPodcast.findMany();
        const etiquetasCancion = await prisma.etiquetaCancion.findMany();

        // Combino todaas las etiquetas en un solo array
        const todasLasEtiquetas = [...etiquetasPodcast, ...etiquetasCancion];

        // Envío la respuesta como JSON
        res.json(todasLasEtiquetas);
    } catch (error) {
        console.error('Error al obtener las etiquetas:', error);
        res.status(500).send('Error al obtener las etiquetas');
    }
});

// PRE: Verdad
// POST: Devuelve en un JSON las etiquetas de podcast de la base de datos
etiquetasRouter.get('/etiquetas/podcast/', async function(req: Request, res: Response) {
    try {
        const etiquetasPodcast = await prisma.etiquetaPodcast.findMany();
        // Envío la respuesta como JSON
        res.json(etiquetasPodcast);
    } catch (error) {
        console.error('Error al obtener las etiquetas de podcast:', error);
        res.status(500).send('Error al obtener las etiquetas de podcast');
    }
});

// PRE: Verdad
// POST: Devuelve en un JSON las etiquetas de canción de la base de datos
etiquetasRouter.get('/etiquetas/cancion/', async function(req: Request, res: Response) {
    try {
        const etiquetasCancion = await prisma.etiquetaCancion.findMany();
        // Envío la respuesta como JSON
        res.json(etiquetasCancion);
    } catch (error) {
        console.error('Error al obtener las etiquetas de canción:', error);
        res.status(500).send('Error al obtener las etiquetas de canción');
    }
});

>>>>>>> Stashed changes:routes/etiquetasRoutes.ts
>>>>>>> Stashed changes
