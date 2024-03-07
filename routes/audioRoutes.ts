// -AUDIO ----> Alain
// ------/audio/delete/<idAudio> : Borra un audio de la base de datos.
// ------[PUT]/audio/<idAudio>/ : Edita un audio de la base de datos.

import express, { Express, Request, Response } from "express";

import { PrismaClient } from '@prisma/client';


// Librearía para subir archivos de audio
import multer from 'multer';

export const audioRouter = express.Router();

// Interfaz para poder acceder a la propiedad file en el request a la hora de subir un archivo
interface MulterRequest extends Request {
    file?: Express.Multer.File; // file puede ser undefined si no se sube ningún archivo
}

const prisma = new PrismaClient();
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
audioRouter.get('/audio/:idaudio', async function(req, res: Response) {
    const id = Number(req.params.idaudio);
    try {
        const audio = await prisma.audio.findUnique({
            where: {
                idAudio: id,
            },
        });
        if (audio) {
            res.json(audio);
        } else {
            return res.json({ Error: '1',message:'Error, audio no encontrado en la base de datos'})
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

//PRE: Se recibe un id de audio correcto en la URL
//POST: Se devuelve el archivo de audio en chunks
audioRouter.get('/audio/play/:idaudio', function(req, res) {
    var cancion = path.join(projectRootPath,'audios',req.params.idaudio);
    mediaserver.pipe(req, res, cancion);
});


//PRE: Se recibe un audio en formato .mp3 o .wav
//POST: Se sube el archivo a la base de datos
audioRouter.post('/audio/upload', upload.single('cancion'), async function(req: MulterRequest, res: Response) {
    try {
        const audioData = {
            titulo: req.body.titulo,
            path: req.body.path,
            duracionSeg: req.body.duracionSeg,
            fechaLanz: req.body.fechaLanz,
            esAlbum: req.body.esAlbum,
        };

        console.log(audioData);
        const audio = await prisma.audio.create({
            data: audioData,
        });

        res.json( { message: 'Audio added successfully' } );
    } catch (error) {
        res.status(500).send(error);
    }


});


//PRE: Se recibe un id de audio correcto en la URL
//POST: Se elimina el registro de BBDD y la canción del servidor
audioRouter.get('/audio/delete/:idaudio', async function(req, res: Response) {
    const id = Number(req.params.idaudio);

    try {

        const audioRuta = await prisma.audio.findUnique({
            where: {
                idAudio: id,
            },
        });
        if (!audioRuta) {
            return res.json({ Error: '1',message:'Error, audio no encontrado en la base de datos'})
        }
        const audio = await prisma.audio.delete({
            where: {
                idAudio: id,
            },
        });
        try{
            fs.unlinkSync(path.join(projectRootPath,audioRuta.path)); //Borra el archivo del servidor
        }
        catch (error){
            res.json({ Error: 'Error, audio no encontrado en el servidor local' });
        }
        res.json({ message: 'Audio deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
});


//PRE: Se recibe un id de audio correcto en la URL
//POST: Se edita el registro de BBDD y la canción del servidor
audioRouter.put('/audio/:idaudio', upload.single('cancion'), async function(req: MulterRequest, res: Response) {
    const id = Number(req.params.idaudio);
    try {
        const audio = await prisma.audio.update({
            where: {
                idAudio: id,
            },
            data: req.body,
        });
        res.json( { message: 'Audio updated successfully' } );
    } catch (error) {
        res.status(500).send(error);
    }
});