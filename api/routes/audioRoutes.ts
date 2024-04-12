const projectRootPath = process.cwd(); // Devuelve el directorio raíz del proyecto y se almacena en una constante

import { Router , Request} from "express";
import * as auth from "../middleware/authenticator.js";

import * as audioController from '../controllers/audioController.js';
const router = Router();

//elemento prisma para acceder a la base de datos declarado en el archivo index.ts de la carpeta prisma
// Librería para subir archivos de audio



//PRE: Se recibe un id de audio correcto en la URL
//POST: Sube obtiene información de un audio con formato JSON
router.get('/:idaudio',auth.authenticate,audioController.verifyAudio,audioController.getAudio);

//PRE: Se recibe un id de audio correcto en la URL
//POST: Se devuelve el archivo de audio en chunks
router.get('/play/:idaudio', auth.authenticate,audioController.verifyAudio, audioController.playAudio);


//PRE: Se recibe un audio en formato .mp3 o .wav, con un título, duración y fecha de lanzamiento en formato ISO-8601
//POST: Se sube el archivo a la base de datos
router.post('/upload',auth.authenticate, audioController.verifyUsersList, audioController.createAudio);


//PRE: Se recibe un id de audio correcto en la URL
//POST: Se elimina el registro de BBDD y la canción del servidor
router.delete('/delete/:idaudio', auth.authenticate,audioController.verifyAudio,audioController.deleteAudio);

//PRE: Se recibe un id de audio correcto en la URL
//POST: Se edita el registro de BBDD y la canción del servidor
router.put('/update/:idaudio', auth.authenticate,audioController.verifyAudio,audioController.verifyUsersList, audioController.updateAudio);

export default router;