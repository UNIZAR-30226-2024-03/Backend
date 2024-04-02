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
        const audio1 = await audioDatabase.createAudioDB('Test Audio', 'pruebaTest1.mp3', 120, '2022-01-01', 'Album', false, [9, 10]);
        const audio2 = await audioDatabase.createAudioDB('Test Audio 2', 'pruebaTest2.mp3', 120, '2022-01-01', 'Album', false, [9, 10]);
        const audio3 = await audioDatabase.createAudioDB('Test Audio 3', 'pruebaTest3.mp3', 120, '2022-01-01', 'Album', false, [9, 10]);
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
    });

    it('returns 404 not found', async () => {
        const res = await supertest(app)
            .get('/audio/0');
        expect(res.statusCode).toEqual(404);
    });

    it('should get an audio by id', async () => {
        const res = await supertest(app)
            .get('/audio/play/1');
        expect(res.statusCode).toEqual(200);
    });

    it('returns 404 not found', async () => {
        const res = await supertest(app)
            .get('/audio/play/0');
        expect(res.statusCode).toEqual(404);
    });

    let audio_id_created: number;
    it('should create a new audio', async () => {
        const res = await supertest(app)
            .post('/audio/upload')
            .attach('cancion', 'api/tests/pruebasUnitarias.mp3')
            .send({
                titulo: 'Test Audio',
                duracionSeg: 120,
                fechaLanz: '2022-01-01',
                esAlbum: 'Si',
                esPrivada: false,
                idsUsuarios2: [9, 10]
            });
        expect(res.statusCode).toEqual(200);
        audio_id_created = res.body.idAudio;
    });


    
    it('should delete an audio by id', async () => {
        const res = await supertest(app)
            .delete(`/audio/${audio_id_created}`);
        expect(res.statusCode).toEqual(200);
    });

    it('returns 404 not found', async () => {
        const res = await supertest(app)
            .delete('/audio/0');
        expect(res.statusCode).toEqual(404);
    });

    it('should update an audio by id', async () => {
        const res = await supertest(app)
            .put(`/audio/update/${audio2_id}`)
            .send({
                titulo: 'Updated Audio'
            });
        expect(res.statusCode).toEqual(200);
    });
    it('returns 404 not found', async () => {
        const res = await supertest(app)
            .put(`/audio/update/0`)
            .send({
                titulo: 'Updated Audio'
            });
        expect(res.statusCode).toEqual(404);
    });

    it('should get artist of an audio by id', async () => {
        const res = await supertest(app)
            .get('/audio/1/artist');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('Artistas');
    });
});