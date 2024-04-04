import supertest from "supertest";
import app from "../app.js";
import * as audioDatabase from "../../db/audioDb.js";
import fs from 'fs';
import path from 'path';
import util from 'util';
const projectRootPath = process.cwd();
const copyFile = util.promisify(fs.copyFile);

describe('Audio Endpoints', () => {
    let audio1_id: number;
    let audio2_id: number;
    let audio3_id: number;

    beforeAll(async () => {
        const audio1 = await audioDatabase.createAudioDB('Test Audio', 'pruebaTest1.mp3', 120, new Date('2022-01-01').toISOString(), 'Album', false, [9, 10]);
        const audio2 = await audioDatabase.createAudioDB('Test Audio 2', 'pruebaTest2.mp3', 120, new Date('2022-01-01').toISOString(), 'Album', false, [9, 10]);
        const audio3 = await audioDatabase.createAudioDB('Test Audio 3', 'pruebaTest3.mp3', 120, new Date('2022-01-01').toISOString(), 'Album', false, [9, 10]);
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
    });


    it('should get an audio by id', async () => {
        const res = await supertest(app)
            .get(`/audio/${audio1_id}`);
        expect(res.statusCode).toEqual(200);
    },15000);

    it('returns 404 not found', async () => {
        const res = await supertest(app)
            .get('/audio/2');
        expect(res.statusCode).toEqual(404);
    },15000);

    it('should get an audio by id', async () => {
        const res = await supertest(app)
            .get('/audio/play/pruebaTest1.mp3');
        expect(res.statusCode).toEqual(200);
    },15000);

    it('returns 404 not found', async () => {
        const res = await supertest(app)
            .get('/audio/play/0');
        expect(res.statusCode).toEqual(404);
    },15000);

    let audio_id_created: any;
    it('should create a new audio', async () => {
        const res = await supertest(app)
            .post('/audio/upload')
            .attach('cancion', 'api/tests/pruebasUnitarias.mp3')
            .field('titulo', 'Test Audio new')
            .field('duracionSeg', 120)
            .field('fechaLanz', new Date('2022-01-01').toISOString())
            .field('esAlbum', 'Si')
            .field('esPrivada', false)
            .field('idsUsuarios', '9,10');
        expect(res.statusCode).toEqual(200);
        audio_id_created = res.body.idaudio;
    },15000);


    
    it('should delete an audio by id', async () => {
        console.log('audio_id_created es:');
        console.log(audio_id_created);
        const res = await supertest(app)
            .get(`/audio/delete/${audio_id_created}`);
        expect(res.statusCode).toEqual(200);
    },15000);


    it('returns 404 not found', async () => {
        const res = await supertest(app)
            .get('/audio/delete/0');
        expect(res.statusCode).toEqual(404);
    },15000);


    it('should update an audio by id', async () => {
        const res = await supertest(app)
            .put(`/audio/update/${audio2_id}`)
            .send({
                titulo: 'Updated Audio'
            });
        expect(res.statusCode).toEqual(200);
    },15000);


    it('returns 404 not found', async () => {
        const res = await supertest(app)
            .put(`/audio/update/0`)
            .send({
                titulo: 'Updated Audio'
            });
        expect(res.statusCode).toEqual(404);
    },15000);


});