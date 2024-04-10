import supertest from "supertest";
import app from "../app";
import path from 'path';
import {
    usuarioCreatePrisma,
    usuarioDeleteEmailPrisma,
  } from "../../db/usuarioDb.js";
import * as audioDatabase from "../../db/audioDb.js";
import { createUsuarioToken } from "../utils/auth/createUsuarioToken.js";
import { copyFile } from "fs/promises";
const projectRootPath = process.cwd();

describe("Etiquetas routes", () => {
    let bearer: string | undefined = undefined;
    let user1_id: number | undefined = undefined;
    let user2_id: number | undefined = undefined;
    let user3_id: number | undefined = undefined;
    let audio1_id: number;
    let audio2_id: number;
    let audio3_id: number;
  
    beforeAll(async () => {
      const user1 = await usuarioCreatePrisma(
        "test",
        "test@testing.com",
        "password",
      );
      const user2 = await usuarioCreatePrisma(
        "test2",
        "test2@testing.com",
        "password",
      );
      const user3 = await usuarioCreatePrisma(
        "test3",
        "test3@testing.com",
        "password",
      );
  
      user1_id = user1.idUsuario;
      user2_id = user2.idUsuario;
      user3_id = user3.idUsuario;
      bearer = createUsuarioToken(user1);

      const audio1 = await audioDatabase.createAudioDB('Test Audio', 'pruebaTest1.mp3', 120, new Date('2022-01-01').toISOString(), false, false, [user1_id, user2_id],"prueba");
      const audio2 = await audioDatabase.createAudioDB('Test Audio 2', 'pruebaTest2.mp3', 120, new Date('2022-01-01').toISOString(), false, false, [user1_id, user2_id],"prueba");
      const audio3 = await audioDatabase.createAudioDB('Test Audio 3', 'pruebaTest3.mp3', 120, new Date('2022-01-01').toISOString(), false, true, [user1_id, user2_id],"prueba");
      
      audio1_id = audio1.idAudio;
      audio2_id = audio2.idAudio;
      audio3_id = audio3.idAudio;
      await copyFile(path.join(projectRootPath,'audios','pruebasUnitarias.mp3'), path.join(projectRootPath,'audios','pruebaTest1.mp3'));
      await copyFile(path.join(projectRootPath,'audios','pruebasUnitarias.mp3'), path.join(projectRootPath,'audios','pruebaTest2.mp3'));
      await copyFile(path.join(projectRootPath,'audios','pruebasUnitarias.mp3'), path.join(projectRootPath,'audios','pruebaTest3.mp3'));


    });

    afterAll(async () => {
      await audioDatabase.deleteAudioById(audio1_id);
      await audioDatabase.deleteAudioById(audio2_id);
      await audioDatabase.deleteAudioById(audio3_id);
      await usuarioDeleteEmailPrisma("test@testing.com");
      await usuarioDeleteEmailPrisma("test2@testing.com");
      await usuarioDeleteEmailPrisma("test3@testing.com");
    });

  const ETIQUETAS_ROUTE = "/etiquetas/"
  const ETIQUETAS_CANCION_ROUTE = "/etiquetas/cancion/"
  const ETIQUETAS_PODCAST_ROUTE = "/etiquetas/podcast/"
  const ETIQUETAS_AUDIOS_ROUTE = "/etiquetas/audios/"


  const ETIQUETAS_ROUTE_BAD = "/etiqueta/"
  const ETIQUETAS_CANCION_ROUTE_BAD = "/etiquetas/canciones/"
  const ETIQUETAS_PODCAST_ROUTE_BAD = "/etiquetas/podcasts/"
  const ETIQUETAS_AUDIOS_ROUTE_BAD = "/etiquetas/audio/"


  describe(`GET ${ETIQUETAS_ROUTE}`, () => {
    it("returns 200 ok bearer", async () => {
      await supertest(app)
        .get(ETIQUETAS_ROUTE)
        .set("Authorization", `Bearer ${bearer}`)
        .expect(200);
    });

    it("returns 401 bad bearer", async () => {
      await supertest(app)
        .get(ETIQUETAS_ROUTE)
        .expect(401);
    });

    it("returns 404 bad url", async () => {
      await supertest(app)
        .get(ETIQUETAS_ROUTE_BAD)
        .set("Authorization", `Bearer ${bearer}`)
        .expect(404);
    });
  });

  describe(`GET ${ETIQUETAS_CANCION_ROUTE}`, () => {
    it("returns 200 ok bearer", async () => {
      await supertest(app)
        .get(ETIQUETAS_CANCION_ROUTE)
        .set("Authorization", `Bearer ${bearer}`)
        .expect(200);
    });

    it("returns 403 bad bearer", async () => {
      await supertest(app)
        .get(ETIQUETAS_CANCION_ROUTE)
        .expect(401);
    });

    it("returns 404 bad url", async () => {
      await supertest(app)
        .get(ETIQUETAS_CANCION_ROUTE_BAD)
        .set("Authorization", `Bearer ${bearer}`)
        .expect(404);
    });
    
  });

  describe(`GET ${ETIQUETAS_PODCAST_ROUTE}`, () => {
    it("returns 200 ok bearer", async () => {
      await supertest(app)
        .get(ETIQUETAS_PODCAST_ROUTE)
        .set("Authorization", `Bearer ${bearer}`)
        .expect(200);
    });

    it("returns 403 bad bearer", async () => {
      await supertest(app)
        .get(ETIQUETAS_PODCAST_ROUTE)
        .expect(401);
    });

    it("returns 404 bad url", async () => {
      await supertest(app)
        .get(ETIQUETAS_PODCAST_ROUTE_BAD)
        .set("Authorization", `Bearer ${bearer}`)
        .expect(404);
    });
  });

  describe(`POST ${ETIQUETAS_AUDIOS_ROUTE}`, () => {
    it("returns 200 ok bearer", async () => {
      await supertest(app)
        .get(ETIQUETAS_PODCAST_ROUTE)
        .set("Authorization", `Bearer ${bearer}`)
        .send({idsAudios: [audio1_id, audio2_id, audio3_id]})
        .expect(200);
    });

    it("returns 401 bad bearer", async () => {
      await supertest(app)
        .get(ETIQUETAS_AUDIOS_ROUTE)
        .send({idsAudios: [audio1_id, audio2_id, audio3_id]})
        .expect(401);
    });

    it("returns 404 bad url", async () => {
      await supertest(app)
        .get(ETIQUETAS_AUDIOS_ROUTE_BAD)
        .set("Authorization", `Bearer ${bearer}`)
        .send({idsAudios: [audio1_id, audio2_id, audio3_id]})
        .expect(404);
    });

    it("returns 400 bad request", async () => {
      await supertest(app)
        .get(ETIQUETAS_AUDIOS_ROUTE)
        .set("Authorization", `Bearer ${bearer}`)
        .send({idsAudio: [audio1_id, audio2_id, audio3_id]})
        .expect(400);
    });

    it("returns 500 bad idAudios", async () => {
      await supertest(app)
        .get(ETIQUETAS_AUDIOS_ROUTE)
        .set("Authorization", `Bearer ${bearer}`)
        .send({idsAudios: [audio1_id, audio2_id, 80]})
        .expect(500);
    });
  });

});

