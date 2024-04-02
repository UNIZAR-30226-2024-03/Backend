// -AUDIO ----> Alain
// ------/audio/delete/<idAudio> : Borra un audio de la base de datos.
// ------[PUT]/audio/<idAudio>/ : Edita un audio de la base de datos.
const projectRootPath = process.cwd(); // Devuelve el directorio raíz del proyecto y se almacena en una constante

import { Router , Request} from "express";

const router = Router();

//elemento prisma para acceder a la base de datos declarado en el archivo index.ts de la carpeta prisma
// Librearía para subir archivos de audio
import multer from 'multer';
import path from 'path';//Variable para manejar rutas de archivos
import mediaserver from 'mediaserver'; //Variable para manejar archivos de audio, usa chunks para enviar el archivo
import * as audioController from '../controllers/audioController.js';




const opciones = multer.diskStorage({ //Opciones para subir archivos
    destination: function(req: Request, file: Express.Multer.File, cb: any) { 
        cb(null, path.join(projectRootPath,'audios')); //Se almacenan en la carpeta audios desde la raiz del proyecto
    },
    filename: function(req: Request, file: Express.Multer.File, cb: any) { 
        cb(null, file.originalname); //Cambiar esto, no puede ser el nombre original
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
router.get('/:idaudio',audioController.getAudio);

//PRE: Se recibe un id de audio correcto en la URL
//POST: Se devuelve el archivo de audio en chunks
router.get('/play/:idaudio', function(req, res) {
    const cancion = path.join(projectRootPath,'audios',req.params.idaudio);
    mediaserver.pipe(req, res, cancion);
});


//PRE: Se recibe un audio en formato .mp3 o .wav, con un título, duración y fecha de lanzamiento en formato ISO-8601
//POST: Se sube el archivo a la base de datos
router.post('/upload', upload.single('cancion'), audioController.verifyUsersList, audioController.createAudio);


//FALTA LÓGICA DE VERIRICACIÓN DE PERMISOS DE USUARIO
//PRE: Se recibe un id de audio correcto en la URL
//POST: Se elimina el registro de BBDD y la canción del servidor
router.get('/delete/:idaudio', audioController.deleteAudio);

//PRE: Se recibe un id de audio correcto en la URL
//POST: Se edita el registro de BBDD y la canción del servidor
router.put('/update/:idaudio', audioController.verifyAudio, upload.single('cancion'), audioController.updateAudio);

export default router;