import { Router } from "express";
import {
  fotoUploadOne,
  fotoTransformSave,
  fotoGet,
} from "../controllers/fotosController.js";

const router = Router();

router.post("/", fotoUploadOne, fotoTransformSave);

router.get("/", fotoGet);

export default router;
