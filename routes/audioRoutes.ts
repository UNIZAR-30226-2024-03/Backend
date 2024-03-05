// -AUDIO ----> Alain
// ------[POST]/audio/upload : Sube un audio a la base de datos.
// ------[DELETE]/audio/<idAudio>/ : Borra un audio de la base de datos.
// ------[PUT]/audio/<idAudio>/ : Edita un audio de la base de datos.
// ------/audio/<idAudio>/ : Devuelve la información de un audio (autor y etiquetas incluidos)
// ------/audio/play/<idAudio>/ : Devuelve el audio a reproducir

import express, { Express, Request, Response } from "express";

// Librearía para subir archivos de audio
import multer from 'multer';

export const audioRouter = express.Router();

// Interfaz para poder acceder a la propiedad file en el request a la hora de subir un archivo
interface MulterRequest extends Request {
    file?: Express.Multer.File; // file puede ser undefined si no se sube ningún archivo
}

const projectRootPath = process.cwd(); // Devuelve el directorio raíz del proyecto y se almacena en una constante
var path = require('path'); //Variable para manejar rutas de archivos
var fs = require('fs'); //Variable para manejar archivos, leer, escribir, etc
var mediaserver = require('mediaserver'); //Variable para manejar archivos de audio, usa chunks para enviar el archivo
var opciones = multer.diskStorage({ //Opciones para subir archivos
    destination: function(req: Request, file: any, cb: any) { 
        cb(null, path.join(projectRootPath,'audios')); //Se almacenan en la carpeta audios desde la raiz del proyecto
    },
    filename: function(req: Request, file: any, cb: any) { 
        cb(null, file.originalname); //Cambiar esto, no puede ser el nombre original
    }


});
var upload = multer(
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
audioRouter.get('/audio/:idaudio', function(req, res: Response) {
     /*
        Lógica de hacer el select en la Base de datos
    */
});

//PRE: Se recibe un id de audio correcto en la URL
//POST: Se devuelve el archivo de audio en chunks
audioRouter.get('/audio/play/:idaudio', function(req, res) {
    var cancion = path.join(projectRootPath,'audios',req.params.idaudio);
    mediaserver.pipe(req, res, cancion);
});


//PRE: Se recibe un audio en formato .mp3 o .wav
//POST: Se sube el archivo a la base de datos
audioRouter.post('/audio/upload', upload.single('cancion'), function(req: MulterRequest, res: Response) {


});
