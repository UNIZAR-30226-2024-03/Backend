// -AUDIO ----> Alain
// ------/audio/delete/<idAudio> : Borra un audio de la base de datos.
// ------[PUT]/audio/<idAudio>/ : Edita un audio de la base de datos.

import express, { Express, Request, Response } from "express";

//elemento prisma para acceder a la base de datos declarado en el archivo index.ts de la carpeta prisma
import prisma  from "../prisma/index.js";

// Librearía para subir archivos de audio
import multer from 'multer';
import path from 'path';//Variable para manejar rutas de archivos
import fs from 'fs'; //Variable para manejar archivos, leer, escribir, etc
import mediaserver from 'mediaserver'; //Variable para manejar archivos de audio, usa chunks para enviar el archivo

export const audioRouter = express.Router();

// Interfaz para poder acceder a la propiedad file en el request a la hora de subir un archivo

interface MulterRequest extends Request {
    file?: Express.Multer.File; // file puede ser undefined si no se sube ningún archivo
    audioConsulta?: any; // Propiedad para almacenar el audio consultado en el middleware a la hora de actualizar
}

const projectRootPath = process.cwd(); // Devuelve el directorio raíz del proyecto y se almacena en una constante
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
audioRouter.get('/:idaudio', async function(req, res: Response) {
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
audioRouter.get('/play/:idaudio', function(req, res) {
    var cancion = path.join(projectRootPath,'audios',req.params.idaudio);
    mediaserver.pipe(req, res, cancion);
});


//PRE: Se recibe un audio en formato .mp3 o .wav, con un título, duración y fecha de lanzamiento en formato ISO-8601
//POST: Se sube el archivo a la base de datos
audioRouter.post('/upload', upload.single('cancion'), async function(req: Request, res: Response, next){ //se verifica la existencia de los usuarios
    try {
        console.log(req.body);
        const idsUsuarios = req.body.idsUsuarios.split(',').map(Number);
        console.log(idsUsuarios);
        for (const idUsuario of idsUsuarios) {
            const usuario = await prisma.usuario.findUnique({
                where: {
                    idUsuario: idUsuario,
                },
            });
            if (!usuario) {
                if (req.file){
                    deleteFile(path.join(projectRootPath,"audios",req.file.originalname));
                }
                return res.json({ Error: '1', message: `Error, usuario con ID ${idUsuario} no existe en la base de datos` });
            }
        }
        console.log('usuarios verificados');
        next();
    }catch (error) {
        if (req.file){
            deleteFile(path.join(projectRootPath,"audios",req.file.originalname));
        }
        return res.json({ Error: '1', message: `Error, usuario con ID no existe en la base de datos` });
    }
    
}, async function(req: MulterRequest, res: Response) { // Subir archivo de audio y ejecutar lógica de creación
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No audio file uploaded' });
        }
        const fechaLanz = new Date(req.body.fechaLanz);
        const fechaFormateada = fechaLanz.toISOString();
        const idsUsuarios2 = req.body.idsUsuarios.split(',').map(Number);
        console.log(idsUsuarios2);
        const audioData = {
            titulo: req.body.titulo,
            path: req.file.originalname,
            duracionSeg: parseInt(req.body.duracionSeg, 10),
            fechaLanz: fechaFormateada,
            esAlbum: req.body.esAlbum,
            Artistas:{
                connect: idsUsuarios2.map((idUsuario:Number) => ({ idUsuario })),

            }
        };
        const audio = await prisma.audio.create({
            data: audioData
        });
        for (const idUsuario of idsUsuarios2) {
            const usuario = await prisma.usuario.update({
                where: {
                    idUsuario: idUsuario,
                },
                data: {
                    Audios: {
                        connect: { idAudio: audio.idAudio },
                    },
                },
            });
        }
        res.json( { message: 'Audio added successfully' } );
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
            if (error.stack) {
                console.error(`Stack trace: ${error.stack}`);
            }
        }
        if (req.file){
            deleteFile(path.join(projectRootPath,"audios",req.file.originalname));
        }
        res.status(500).send(error);

    }
});


function deleteFile(filePath: string) {
    try {
        fs.unlinkSync(filePath); // Borra el archivo del servidor
    } catch (error) {
        throw new Error('Error, audio no eliminando, no encontrado en el servidor local');
    }
}


//FALTA LÓGICA DE VERIRICACIÓN DE PERMISOS DE USUARIO
//PRE: Se recibe un id de audio correcto en la URL
//POST: Se elimina el registro de BBDD y la canción del servidor
audioRouter.get('/delete/:idaudio', async function(req, res: Response) {
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
            deleteFile(path.join(projectRootPath,audioRuta.path));
        }catch (error){
            return res.json({ Error: 'Error, audio no encontrado en el servidor local' });
        }
        res.json({ message: 'Audio deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
});

//PRE: Se recibe un id de audio correcto en la URL
//POST: Se edita el registro de BBDD y la canción del servidor
audioRouter.put('/update/:idaudio', async function(req: MulterRequest, res: Response, next) {
    try {
        const audioConsulta = await prisma.audio.findUnique({
            where: {
                idAudio: Number(req.params.idaudio),
            },
        });
        if (!audioConsulta) {
            return res.json({ Error: 'Error, audio no encontrado en el servidor local' });
        }

        req.audioConsulta = audioConsulta; // Adjuntar audioConsulta al objeto req

        next(); // Pasar al siguiente middleware si audioConsulta existe
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
            if (error.stack) {
                console.error(`Stack trace: ${error.stack}`);
            }
            res.status(500).send(error);
        }
    }
}, upload.single('cancion'), async function(req: MulterRequest, res: Response) { // Subir archivo de audio y ejecutar lógica de actualización
    try {
        let audioData: any = {};

        if (req.file){
            audioData.path = "/audios/"+req.file.originalname;
            deleteFile(path.join(projectRootPath,req.audioConsulta.path)); // Acceder a audioConsulta desde req
        }

        if (req.body.titulo) {
            audioData.titulo = req.body.titulo;
        }
        if (req.body.duracionSeg) {
            audioData.duracionSeg = parseInt(req.body.duracionSeg, 10);
        }
        if (req.body.fechaLanz) {
            const fechaLanz = new Date(req.body.fechaLanz);
            audioData.fechaLanz = fechaLanz.toISOString();
        }
        if (req.body.esAlbum) {
            audioData.esAlbum = req.body.esAlbum;
        }

        const audio = await prisma.audio.update({
            where: { idAudio: Number(req.params.idaudio) },
            data: audioData,
        });

        res.json( { message: 'Audio updated successfully' } );
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
            if (error.stack) {
                console.error(`Stack trace: ${error.stack}`);
            }
            res.status(500).send(error);
        }
    }
});