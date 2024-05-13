import { Response , NextFunction} from "express";
import { Request } from 'express-jwt';

import prisma from "../../prisma/client.js";
import path from 'path';
import fs from 'fs';
import mediaserver from 'mediaserver'; //Variable para manejar archivos de audio, usa chunks para enviar el archivo
import * as etiquetasDatabase from "../../db/etiquetasDb.js";
import * as audioDatabase from "../../db/audioDb.js";
import * as listasDb from '../../db/listaDb.js';
import { promisify } from 'util';
import { json } from "stream/consumers";
const projectRootPath = process.cwd(); // Devuelve el directorio raíz del proyecto y se almacena en una constante




//PRE: Se recibe un id de audio correcto en la URL
//POST: Sube obtiene información de un audio con formato JSON
export async function getAudio(req: Request, res: Response) {
    try {
        const id = Number(req.params.idaudio);

        if (req.body.audioConsulta.esPrivada && !await isOwnerOrAdmin(req)) { //Falta lógica de verificación de usarios
            res.status(403).send("Permission denied, unsifficient permissions");
        }else{
            const artistas = await audioDatabase.getArtistasAudioById(id);
            const vecesEscuchada = await audioDatabase.getVecesEscuchada(id);
            res.json({...req.body.audioConsulta, artistas, vecesEscuchada});
        }

    } catch (error) {
        res.status(500).send(error); // Internal server error
    }
}



//Se encarga de verificar que los usuarios existan en la base de datos
export async function verifyUsersList(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.body.idsUsuarios) {
            const idsUsuarios = req.body.idsUsuarios.split(',').map(Number);
            for (const idUsuario of idsUsuarios) {
                //Preguntar Alvaro si tiene esta función
                const usuario = await prisma.usuario.findUnique({
                    where: {
                        idUsuario: idUsuario,
                    },
                });
                if (!usuario) {
                    return res.status(404).send('Usuario no encontrado');            
                }
            }
        }
        next();
    }catch (error) {
        return res.status(500).send(error);            
    }
}


//Se encarga de verificar que los usuarios existan en la base de datos
export async function verifyLabelList(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.body.etiquetas) {
            if (req.body.tipoEtiqueta==="Podcast" || req.body.tipoEtiqueta==="Cancion") {
                const etiquetas = req.body.etiquetas.split(',').map(Number);
                for (const idEtiqueta of etiquetas) {
                    if (await etiquetasDatabase.existsTag(idEtiqueta)==false) {
                        return res.status(404).send('Etiqueta no encontrada');
                    }
                }
            }else{
                return res.status(400).send('Bad Parameters, etiqueta no válida');
            }
        }else if (!req.body.etiquetas && req.body.tipoEtiqueta) {
            return res.status(400).send('Bad Parameters, faltan las etiquetas');
        }
        next();
    }catch (error) {
        return res.status(404);            
    }
}

export async function createAudio(req: Request, res: Response) {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }
        if (!req.body.titulo                                ||
            !req.body.duracionSeg                           ||
            !req.body.fechaLanz                             || 
            !req.body.esAlbum                               ||
            !req.body.esPrivada                             ||
            !req.body.esPodcast                             || 
            (!req.body.etiquetas && req.body.tipoEtiqueta)  ||
            (req.body.etiquetas && !req.body.tipoEtiqueta)  ||
            (req.body.tipoEtiqueta && req.body.tipoEtiqueta != 'Cancion' && req.body.tipoEtiqueta != 'Podcast')) {
                return res.status(400).send('Bad Parameters, faltan parámetros o etiquetas incorrectas');
        }
        if ((req.body.tipoEtiqueta == 'Podcast' && req.body.esPodcast == 'false') ||
            (req.body.tipoEtiqueta == 'Cancion' && req.body.esPodcast == 'true')) {
            return res.status(400).send('Bad Parameters, un podcast no puede tener etiquetas de canción y viceversa');
        }
        
        const fechaLanz = new Date(req.body.fechaLanz);
        if (isNaN(fechaLanz.getTime())) {
            return  res.status(400).send('Bad Parameters, fecha no válida');
        }

        const fechaFormateada = fechaLanz.toISOString();
        let idsUsuarios2: number[] = [];
        if (req.body.idsUsuarios) {
            idsUsuarios2 = req.body.idsUsuarios.split(',').map(Number);
        }
        idsUsuarios2.push(req.auth?.idUsuario);
        let img = process.env.IMG_AUDIO_DEFAULT || 'null';
        if (req.body.img ) {
            img = req.body.img;
        }
        console.log(req.body)
        // Se copia el archivo del audio, debido a que al moverlo produce un error con el volumen de Docker.
        fs.copyFile(path.join(projectRootPath,'tmp',req.file.filename), path.join(projectRootPath,'audios',req.file.filename), (error) => {
            if (error) {
                    console.error('Error al mover el archivo:', error);
            } else {
                    console.log('Archivo movido exitosamente.');
            }
        });
        const audio = await audioDatabase.createAudioDB(req.body.titulo, req.file.filename, parseInt(req.body.duracionSeg, 10), fechaFormateada, (req.body.esAlbum === 'true'), (req.body.esPrivada === 'true'), idsUsuarios2, img, (req.body.esPodcast === 'true'));
        
        const listas = await listasDb.getListasByPropietario(parseInt(req.auth?.idUsuario));
        let idLista = -1;
        for (const lista of listas) {
            if(req.body.esPodcast == 'true' && lista.tipoLista === 'MIS_PODCAST'){
                idLista = lista.idLista;
            }else if(req.body.esPodcast == 'false' && lista.tipoLista === 'MIS_AUDIOS'){
                idLista = lista.idLista;
            }
        }
        if (idLista != -1) {
            await listasDb.addAudioToLista(idLista, audio.idAudio);
        }else{
            return res.status(500).send('No existe una lista de MIS_AUDIOS para el usuario actual');
        }
        
        if (req.body.etiquetas) {
            const etiquetas = req.body.etiquetas.split(',').map(Number);
            for (const idEtiqueta of etiquetas) {
                console.log("Se va a linkar etiqueta a audio con tipo "+req.body.tipoEtiqueta+" y id "+idEtiqueta+" y id audio "+audio.idAudio);
                await audioDatabase.linkLabelToAudio(audio.idAudio, idEtiqueta, req.body.tipoEtiqueta);
            }


        }

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
            await audioDatabase.addPropietariosToAudio(audio.idAudio, idsUsuarios2);
        }

        res.status(200).json( { message: 'Audio added successfully' ,idaudio: audio.idAudio});

        
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
            if (error.stack) {
                console.error(`Stack trace: ${error.stack}`);
            }
        }
        res.status(500).send(error);
    }
}


export async function deleteAudio(req: Request, res: Response) {

    try {
        const id = Number(req.params.idaudio);
        if (!await isOwnerOrAdmin(req)){
            return res.status(403).send("Permission denied, unsifficient permissions");
        }
        try{
            audioDatabase.deleteAudioById(id);
            deleteFile(path.join(projectRootPath,req.body.audioConsulta.path));
        }catch (error){
            return res.status(404).send(error);            
        }
        res.status(200).json({ message: 'Audio deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
}

export async function verifyAudio(req: Request, res: Response, next: NextFunction) {
    
    try {
        if (!req.params.idaudio) {
            return res.status(400).send('Bad Parameters, idaudio not found');
        }
        const id = Number(req.params.idaudio);
        const audioConsulta = await audioDatabase.findAudioById(id);
        if (!audioConsulta) {
            return res.status(404).send("Audio not found");            
        }

        req.body.audioConsulta = audioConsulta; // Adjuntar audioConsulta al objeto req

        next(); // Pasar al siguiente middleware si audioConsulta existe
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
            if (error.stack) {
                console.error(`Stack trace: ${error.stack}`);
            }
            res.status(500).send(error.message);
        }
    }
}

export async function updateAudio(req: Request, res: Response) {
    try {
        if (!await isOwnerOrAdmin(req)){
            return res.status(403).send("Permission denied, unsifficient permissions");
        }
        let audioData: any = {};
        if (req.file){
            fs.copyFile(path.join(projectRootPath,'tmp',req.file.filename), path.join(projectRootPath,'audios',req.file.filename), (error) => {
                if (error) {
                    console.error('Error al mover el archivo para actualizar audio:', error);
                    throw error;
                } else {
                    console.log('Archivo actualizado y movido exitosamente.');
                }
            });
            
            audioData.path = "/audios/"+req.file.filename;
            try{
                deleteFile(path.join(projectRootPath,req.body.audioConsulta.path)); // Acceder a audioConsulta desde req
            }catch (error){
                // No se hace nada si no se encuentra el archivo, no pasa nada
            }
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
            audioData.esAlbum = req.body.esAlbum === 'true';
        }

        if (req.body.esPrivada) {
            audioData.esPrivada = req.body.esPrivada === 'true';
        }
        if (req.body.img) {
            audioData.imgAudio = req.body.img;    
        }
        
        audioDatabase.updateAudioById(Number(req.params.idaudio),audioData);

        if (req.body.etiquetas) {
            if (req.body.tipoEtiqueta=='Podcast' || req.body.tipoEtiqueta=='Cancion') {
                await audioDatabase.unlinkAllLabelsFromAudio(Number(req.params.idaudio), req.body.tipoEtiqueta);
                const etiquetas = req.body.etiquetas.split(',').map(Number);
                for (const idEtiqueta of etiquetas) {
                    await audioDatabase.linkLabelToAudio(Number(req.params.idaudio), idEtiqueta, req.body.tipoEtiqueta);
                }
            }else{
                return res.status(400).send('Bad Parameters,  tipo de etiqueta no válida');
            }
        }else if (!req.body.etiquetas && req.body.tipoEtiqueta) {
            return res.status(400).send('Bad Parameters, faltan las etiquetas');
        }

        if(req.body.idsUsuarios){
            const idsUsuarios = req.body.idsUsuarios.split(',').map(Number);
            if (idsUsuarios.length === 0) {
                const audioDel =await audioDatabase.findAudioById(Number(req.params.idaudio));
                await audioDatabase.deleteAudioById(Number(req.params.idaudio));
                if (audioDel) {
                    deleteFile(path.join(projectRootPath,audioDel.path));
                }
            }else{
                await audioDatabase.addPropietariosToAudio(Number(req.params.idaudio), idsUsuarios);

            }
        }

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


export async function playAudio(req: Request, res: Response) {
    try {
        const audio = await audioDatabase.findAudioById(Number(req.params.idaudio));
        if (!audio) {
            return res.status(404).send("Audio not found");            
        }
        const cancion = path.join(projectRootPath, audio.path);
        const access = promisify(fs.access);
        await access(cancion, fs.constants.F_OK);
        if (!audio.esPrivada || await isOwnerOrAdmin(req)){
            await audioDatabase.listenToAudio(req.auth?.idUsuario,Number(req.params.idaudio));
            mediaserver.pipe(req, res, cancion);
        }else{
            return res.status(403).send("Permission denied, unsifficient permissions");
        }
    } catch (err) {
        console.log(err);
        res.status(404).send('File not found');
    }
}

export function deleteTmpFiles(req: Request, res: Response, next: NextFunction){
    const folder = path.join(projectRootPath,'tmp');
    if (!fs.existsSync(folder)){
        fs.mkdirSync(folder, { recursive: true });
    }else{
        fs.readdir(folder, (err, files) => {
            if (err) {
                console.error(err);
                return;
            }
            for (const file of files) {
                fs.unlink(path.join(folder, file), err => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                });
            }
        });
    }
    next();
}


export async function audioStats(req: Request, res: Response) {
    try {
        const id = Number(req.params.idaudio);
        const date = req.body.date; //formato "MM-YYYY"

        if (!date || !/^([0-9]{2})-([0-9]{4})$/.test(date)) {
            return res.status(400).send('Bad Parameters, falta parámetro date o formato de fecha incorrecto');
        }else{
            const [month, year] = date.split('-').map(Number);
            if (month < 1 || month > 12 || year < 1800) {
                return res.status(400).send('Bad Parameters, fecha no válida');
            }
            const stats = await audioDatabase.getAudioStats(id, month, year);
            res.json(stats);
        }
    } catch (error) {
        res.status(500).send(error);
    }
}


export async function getLastUploadedAudios(req: Request, res: Response) {
    try {
        const audios = await audioDatabase.getLastUploadedAudios();
        res.json(audios);
    } catch (error) {
        res.status(500).send(error);
    }
}


export async function getMostListenedAudios(req: Request, res: Response) {
    try {
        const audios = await audioDatabase.getMostListenedAudios();
        res.json(audios);
    } catch (error) {
        res.status(500).send(error);
    }
}


export async function getNRandomAudios(req: Request, res: Response) {
    try {
        const n = Number(req.params.nAudios);
        if (!n || n <= 0) {
            return res.status(400).send('Bad Parameters, nAudios must be a positive number');
        }
        const audios = await audioDatabase.getNRandomAudios(n);
        res.json(audios);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
}

function deleteFile(filePath: string) {
    try {
        fs.unlinkSync(filePath); // Borra el archivo del servidor
    } catch (error) {
        throw new Error('Error, audio no eliminando, no encontrado en el servidor local');
    }
}

async function isOwnerOrAdmin(req: Request){
        if (!req.auth?.esAdmin) {
            const propietarios = await audioDatabase.getIdArtistaAudioById(parseInt(req.params.idaudio));

            if (propietarios.length === 0) {
                throw new Error("Audio no encontrado");
            }
            if (!propietarios.includes(parseInt(req.auth?.idUsuario))) {
                return false;
            }
        }
        return true;
}


