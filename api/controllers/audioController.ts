import { Request, Response , NextFunction} from "express";
import prisma from "../../prisma/client.js";
import path from 'path';
import fs from 'fs';
import * as audioDatabase from "../../db/audioDb.js";

const projectRootPath = process.cwd(); // Devuelve el directorio raíz del proyecto y se almacena en una constante


export async function getAudio(req: Request, res: Response) {
    const id = Number(req.params.idaudio);
    try {
        const audio = await audioDatabase.findAudioById(id);
        if (audio) {
            res.json(audio);
        } else {
            return res.status(400); // Bad request, parámetros incorrecto
        }
    } catch (error) {
        res.status(500).send(error); // Internal server error
    }
}


export async function verifyUsersList(req: Request, res: Response, next: NextFunction) {
    try {
        console.log(req.body);
        const idsUsuarios = req.body.idsUsuarios.split(',').map(Number);
        console.log(idsUsuarios);
        for (const idUsuario of idsUsuarios) {
            //Preguntar Alvaro si tiene esta función
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
}

export async function createAudio(req: Request, res: Response) {
    try {
        if (!req.file) {
            return res.status(400);
        }
        const fechaLanz = new Date(req.body.fechaLanz);
        const fechaFormateada = fechaLanz.toISOString();
        const idsUsuarios2 = req.body.idsUsuarios.split(',').map(Number);
        console.log(idsUsuarios2);
        const audioData = {
            titulo: req.body.titulo,
            path: "/audios/"+req.file.originalname,
            duracionSeg: parseInt(req.body.duracionSeg, 10),
            fechaLanz: fechaFormateada,
            esAlbum: req.body.esAlbum,
            esPrivada: Boolean(req.body.esPrivada),
            Artistas:{
                connect: idsUsuarios2.map((idUsuario: number) => ({ idUsuario })),
            }
        };
        console.log(audioData);
        const audio = await audioDatabase.createAudioDB(audioData);
        console.log(audio);
        for (const idUsuario of idsUsuarios2) {
            //Preguntar Alvaro si tiene esta función
            await prisma.usuario.update({
                where: {
                    idUsuario: idUsuario,
                },
                data: {
                    Audios: {
                        connect: { idAudio: audio.idAudio },
                    },
                },
            });
            console.log('usuario actualizado');
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
}


export async function deleteAudio(req: Request, res: Response) {
    const id = Number(req.params.idaudio);

    try {

        const audioRuta =await audioDatabase.findAudioById(id)
        if (!audioRuta) {
            return res.json({ Error: '1',message:'Error, audio no encontrado en la base de datos'})
        }
        audioDatabase.deleteAudioById(id);
        try{
            deleteFile(path.join(projectRootPath,audioRuta.path));
        }catch (error){
            return res.json({ Error: 'Error, audio no encontrado en el servidor local' });
        }
        res.json({ message: 'Audio deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
}

export async function verifyAudio(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.idaudio);
    
    try {
        const audioConsulta = await audioDatabase.findAudioById(id);
        if (!audioConsulta) {
            return res.json({ Error: 'Error, audio no encontrado en el servidor local' });
        }

        req.body.audioConsulta = audioConsulta; // Adjuntar audioConsulta al objeto req

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
}

export async function updateAudio(req: Request, res: Response) {
    try {
        let audioData: any = {};

        if (req.file){
            audioData.path = "/audios/"+req.file.originalname;
            deleteFile(path.join(projectRootPath,req.body.audioConsulta.path)); // Acceder a audioConsulta desde req
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

        audioDatabase.updateAudioById(Number(req.params.idaudio),audioData);

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
}

function deleteFile(filePath: string) {
    try {
        fs.unlinkSync(filePath); // Borra el archivo del servidor
    } catch (error) {
        throw new Error('Error, audio no eliminando, no encontrado en el servidor local');
    }
}
