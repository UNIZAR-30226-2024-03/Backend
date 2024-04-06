const projectRootPath = process.cwd(); // Devuelve el directorio raíz del proyecto y se almacena en una constante

import { Router , Request} from "express";
import * as auth from "../middleware/authenticator.js";
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';//Variable para manejar rutas de archivos
import * as audioController from '../controllers/audioController.js';
const router = Router();

//elemento prisma para acceder a la base de datos declarado en el archivo index.ts de la carpeta prisma
// Librería para subir archivos de audio

//Configuración de multer
const opciones = multer.diskStorage({ //Opciones para subir archivos
    destination: function(req: Request, file: Express.Multer.File, cb: any) { 
        cb(null, path.join(projectRootPath,'audios')); //Se almacenan en la carpeta audios desde la raiz del proyecto
    },
    filename: function(req: Request, file: Express.Multer.File, cb: any) { 
        const now = Date.now().toString(); // Salt
        const hash = crypto.createHash('sha1').update(file.originalname + now).digest('hex'); // Hash
        const extension = path.extname(file.originalname);
        cb(null, `${hash}${extension}`); 
    }
});
const upload = multer(
    {storage: opciones,
    fileFilter: function (req, file, cb) { //Filtro para aceptar solo archivos de audio
        if (file.mimetype !== 'audio/mpeg' && file.mimetype !== 'audio/wav' && file.mimetype !== 'audio/mp4') { //Si el archivo no es de tipo mp3(mpeg es mp3), wav o mp4
            return cb(null, false); // No se acepta el archivo, se devuelve el callback con false
        }
        cb(null, true); // Se acepta el archivo y se devuelve el callback con true
    }
});


//PRE: Se recibe un id de audio correcto en la URL
//POST: Sube obtiene información de un audio con formato JSON
router.get('/:idaudio',auth.authenticate,audioController.getAudio);

//PRE: Se recibe un id de audio correcto en la URL
//POST: Se devuelve el archivo de audio en chunks
router.get('/play/:idaudio', auth.authenticate, audioController.playAudio);


//PRE: Se recibe un audio en formato .mp3 o .wav, con un título, duración y fecha de lanzamiento en formato ISO-8601
//POST: Se sube el archivo a la base de datos
router.post('/upload', upload.single('cancion'),auth.authenticate, audioController.verifyUsersList, audioController.createAudio);


//PRE: Se recibe un id de audio correcto en la URL
//POST: Se elimina el registro de BBDD y la canción del servidor
router.get('/delete/:idaudio', auth.authenticate,audioController.deleteAudio);

//PRE: Se recibe un id de audio correcto en la URL
//POST: Se edita el registro de BBDD y la canción del servidor
router.put('/update/:idaudio', auth.authenticate,audioController.verifyAudio, upload.single('cancion'), audioController.updateAudio);

export default router;