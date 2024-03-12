import { Router } from "express";

import * as auth from "../middleware/authenticator.js";
import * as fotosCon from "../controllers/fotosController.js";
import { validate } from "../middleware/validator/index.js";
import { fotoGetSchema } from "../middleware/validator/fotosValidator.js";

const router = Router();

router.post("/", auth.authenticate, fotosCon.fotoUploadOne, fotosCon.fotoTransformSave);
router.get("/:id", auth.authenticate, validate(fotoGetSchema), fotosCon.fotoGet);

export default router;
