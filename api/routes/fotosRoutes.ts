/**
 * @swagger
 * tags:
 *   name: Fotos
 *   description: Operaciones relacionadas con las fotos
 */
import { Router } from "express";

import * as auth from "../middleware/authenticator.js";
import * as fotosCon from "../controllers/fotosController.js";
import { validate } from "../middleware/validator/index.js";
import { fotoGetSchema } from "../middleware/validator/fotosValidator.js";

const router = Router();

/**
 * @swagger
 * /foto:
 *   post:
 *     summary: Sube una foto
 *     description: Sube una foto al servidor.
 *     tags: [Fotos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               foto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '201':
 *         description: Éxito, la foto se ha subido correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: id de la foto subida
 *             example:
 *               id: "44fa4606-1369-4c4c-9aa9-90687a311916"
 *       '400':
 *         description: Error, la foto no se ha subido correctamente.
 *       '401':
 *         description: No autorizado, el usuario no tiene permiso para acceder.
 *       '500':
 *         description: Error interno del servidor.
 */
router.post(
  "/",
  auth.authenticate,
  fotosCon.fotoUploadOne,
  fotosCon.fotoTransformSave,
);

/**
 * @swagger
 * /foto/{id}:
 *   get:
 *     summary: Obtiene una foto
 *     description: Obtiene una foto del servidor.
 *     tags: [Fotos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id de la foto a obtener.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Éxito, devuelve la foto.
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       '400':
 *         description: Error, la foto no se ha obtenido correctamente.
 *       '401':
 *         description: No autorizado, el usuario no tiene permiso para acceder.
 *       '404':
 *         description: No se ha encontrado la foto.
 *       '500':
 *         description: Error interno del servidor.
 */
router.get(
  "/:id",
  validate(fotoGetSchema),
  fotosCon.fotoGet,
);

export default router;
