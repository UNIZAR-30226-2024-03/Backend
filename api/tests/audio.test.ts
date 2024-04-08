import supertest from "supertest";
import app from "../app.js";
import * as audioDatabase from "../../db/audioDb.js";
import fs from 'fs';
import path from 'path';
import util from 'util';
const projectRootPath = process.cwd();
import {usuarioCreatePrisma,usuarioDeleteEmailPrisma} from "../../db/usuarioDb.js";
import { createUsuarioToken } from '../utils/auth/createUsuarioToken.js';

const copyFile = util.promisify(fs.copyFile);

describe('Audio Endpoints', () => {
    let audio1_id: number;
    let audio2_id: number;
    let audio3_id: number;
    let user1_id: number;
    let user2_id: number;
    let user3_id: number;
    let bearer1: string;
    let bearer2: string;
    let bearer3: string;
    beforeAll(async () => {

        const user1 = await usuarioCreatePrisma(
            "audio1",
            "audio1@testingaudio.com",
            "password",
          );
          const user2 = await usuarioCreatePrisma(
            "audio2",
            "audio2@testingaudio.com",
            "password",
          );
          const user3 = await usuarioCreatePrisma(
            "audio3",
            "audio3@testingaudio.com",
            "password",
          );
        
        user1_id = user1.idUsuario;
        user2_id = user2.idUsuario;
        user3_id = user3.idUsuario;
        bearer1 = createUsuarioToken(user1);
        bearer2 = createUsuarioToken(user2);
        bearer3 = createUsuarioToken(user3); 


        const audio1 = await audioDatabase.createAudioDB('Test Audio', 'pruebaTest1.mp3', 120, new Date('2022-01-01').toISOString(), false, false, [user1_id, user2_id],"prueba");
        const audio2 = await audioDatabase.createAudioDB('Test Audio 2', 'pruebaTest2.mp3', 120, new Date('2022-01-01').toISOString(), false, false, [user1_id, user2_id],"prueba");
        const audio3 = await audioDatabase.createAudioDB('Test Audio 3', 'pruebaTest3.mp3', 120, new Date('2022-01-01').toISOString(), false, true, [user1_id, user2_id],"prueba");
        
        audio1_id = audio1.idAudio;
        audio2_id = audio2.idAudio;
        audio3_id = audio3.idAudio;
        await copyFile(path.join(projectRootPath,'api','tests','pruebasUnitarias.mp3'), path.join(projectRootPath,'audios','pruebaTest1.mp3'));
        await copyFile(path.join(projectRootPath,'api','tests','pruebasUnitarias.mp3'), path.join(projectRootPath,'audios','pruebaTest2.mp3'));
        await copyFile(path.join(projectRootPath,'api','tests','pruebasUnitarias.mp3'), path.join(projectRootPath,'audios','pruebaTest3.mp3'));

    });
 
    afterAll(async () => {
        await audioDatabase.deleteAudioById(audio1_id);
        await audioDatabase.deleteAudioById(audio2_id);
        await audioDatabase.deleteAudioById(audio3_id);
        await usuarioDeleteEmailPrisma("audio1@testingaudio.com");
        await usuarioDeleteEmailPrisma("audio2@testingaudio.com");
        await usuarioDeleteEmailPrisma("audio3@testingaudio.com");
        
    });


    it('should get an audio by id', async () => {
        const res = await supertest(app)
            .get(`/audio/${audio1_id}`)
            .set('Authorization', `Bearer ${bearer1}`);
        expect(res.statusCode).toEqual(200);
    },15000);

    it('should get an audio by id', async () => {
        const res = await supertest(app)
            .get(`/audio/${audio1_id}`)
            .set('Authorization', `Bearer ${bearer3}`);
        expect(res.statusCode).toEqual(200);
    },15000);

    it('returns a 403 error, Auth failed', async () => {
        const res = await supertest(app)
            .get(`/audio/${audio3_id}`)
            .set('Authorization', `Bearer ${bearer3}`);
        expect(res.statusCode).toEqual(403);
    },15000);

    it('returns 404 not found', async () => {
        const res = await supertest(app)
            .get('/audio/0')
            .set('Authorization', `Bearer ${bearer1}`);

        expect(res.statusCode).toEqual(404);
    },15000);

    it('should get an audio by id', async () => {
        const res = await supertest(app)
            .get(`/audio/play/${audio1_id}`)
            .set('Authorization', `Bearer ${bearer1}`);
        expect(res.statusCode).toEqual(200);
    },15000);

    it('should get an audio by id', async () => {
        const res = await supertest(app)
            .get(`/audio/play/${audio3_id}`)
            .set('Authorization', `Bearer ${bearer1}`);
        expect(res.statusCode).toEqual(200);
    },15000);

    it('returns a 403, auth failed', async () => {
        const res = await supertest(app)
            .get(`/audio/play/${audio3_id}`)
            .set('Authorization', `Bearer ${bearer3}`);
        expect(res.statusCode).toEqual(403);
    },15000);

    it('returns 404 not found', async () => {
        const res = await supertest(app)
            .get('/audio/play/0')
            .set('Authorization', `Bearer ${bearer1}`);

        expect(res.statusCode).toEqual(404);
    },15000);

    let audio_id_created: number;
    it('should create a new audio', async () => {
        const res = await supertest(app)
            .post('/audio/upload')
            .set('Authorization', `Bearer ${bearer1}`)
            .attach('cancion', 'api/tests/pruebasUnitarias.mp3')
            .field('titulo', 'Test Audio correct')
            .field('duracionSeg', 120)
            .field('fechaLanz', new Date('2022-01-01').toISOString())
            .field('esAlbum', false)
            .field('esPrivada', false)
            .field('idsUsuarios', `${user1_id},${user2_id}`)
            .field('img', 'prueba');
        audio_id_created = res.body.idaudio;
        expect(res.statusCode).toEqual(200);
    },15000);

    it('returns a 400, bad parameters', async () => {
        const res = await supertest(app)
            .post('/audio/upload')
            .set('Authorization', `Bearer ${bearer1}`)
            .attach('cancion', 'api/tests/pruebasUnitarias.mp3')
            .field('titulo', 'Test Audio new')
            .field('dur', 120)
            .field('fechaLanz', new Date('2022-01-01').toISOString())
            .field('esAlbum',false)
            .field('b', false)
            .field('idsUsuarios', `${user1_id},${user2_id}`)
            .field('img', 'prueba');
        expect(res.statusCode).toEqual(400);
    },15000);

    it('returns a 403, auth failed', async () => {

        const res = await supertest(app)
            .get(`/audio/delete/${audio_id_created}`)
            .set('Authorization', `Bearer ${bearer3}`);

        expect(res.statusCode).toEqual(403);
    },15000);
    
    it('should delete an audio by id', async () => {

        const res = await supertest(app)
            .get(`/audio/delete/${audio_id_created}`)
            .set('Authorization', `Bearer ${bearer1}`);

        expect(res.statusCode).toEqual(200);
    },15000);


    it('returns 404 not found', async () => {
        const res = await supertest(app)
            .get('/audio/delete/0')
            .set('Authorization', `Bearer ${bearer1}`);

        expect(res.statusCode).toEqual(404);
    },15000);


    it('should update an audio by id', async () => {
        const res = await supertest(app)
            .put(`/audio/update/${audio2_id}`)
            .set('Authorization', `Bearer ${bearer1}`)
            .send({
                titulo: 'Updated Audio'
            });
        expect(res.statusCode).toEqual(200);
    },15000);

    it('returns 404 not found', async () => {
        const res = await supertest(app)
            .put(`/audio/update/0`)
            .set('Authorization', `Bearer ${bearer1}`)
            .send({
                titulo: 'Updated Audio'
            });
        expect(res.statusCode).toEqual(404);
    },15000);




});

