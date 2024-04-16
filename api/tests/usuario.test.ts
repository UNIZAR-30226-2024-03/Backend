import supertest from "supertest";
import app from "../app.js";
import {
  usuarioCreatePrisma,
  usuarioDeleteEmailPrisma,
  usuarioFollowPrisma,
} from "../../db/usuarioDb.js";
import {
  createAudioDB,
  deleteAudioById,
} from "../../db/audioDb.js";
import { createUsuarioToken } from "../utils/auth/createUsuarioToken.js";

describe("Usuario routes", () => {
  let bearer: string | undefined = undefined;
  let user1_id: number | undefined = undefined;
  let user2_id: number | undefined = undefined;
  let user3_id: number | undefined = undefined;
  const audio_id: number | undefined = 99;
  let cancion1_id: number | undefined = undefined;
  let cancion2_id: number | undefined = undefined;
  let podcast1_id: number | undefined = undefined;

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

    // publico, propiedad de user1 y user2
    const cancion1 = await createAudioDB(
      "cancion1",
      "cancion1.mp3",
      100,
      new Date().toISOString(),
      false,
      false,
      [user1_id, user2_id],
      "img",
      false
    );
    // privado, propiedad de user1
    const cancion2 = await createAudioDB(
      "cancion2",
      "cancion2.mp3",
      100,
      new Date().toISOString(),
      false,
      false,
      [user1_id],
      "img",
      false
    );
    // publico, propiedad de user1
    const podcast1 = await createAudioDB(
      "podcast",
      "podcast.mp3",
      100,
      new Date().toISOString(),
      false,
      false,
      [user1_id],
      "img",
      true
    );
    cancion1_id = cancion1.idAudio;
    cancion2_id = cancion2.idAudio;
    podcast1_id = podcast1.idAudio;

  });
  afterAll(async () => {
    return await Promise.all([
      usuarioDeleteEmailPrisma("test@testing.com"),
      usuarioDeleteEmailPrisma("test2@testing.com"),
      usuarioDeleteEmailPrisma("test3@testing.com"),
      deleteAudioById(cancion1_id ?? 0),
      deleteAudioById(cancion2_id ?? 0),
      deleteAudioById(podcast1_id ?? 0),
    ]);
  });

  const USUARIO_ROUTE = "/usuario";
  const USUARIO_AUDIO_ROUTE = "/usuario/audios";
  const USUARIO_FOLLOW_ROUTE = "/usuario/follow/";
  const USUARIO_UNFOLLOW_ROUTE = "/usuario/unfollow/";

  describe(`GET ${USUARIO_ROUTE}`, () => {
    it("returns 400 bad params", async () => {
      await supertest(app)
        .get(USUARIO_ROUTE)
        .query({
          idUsuario: "invalid_number",
          rrss: "invalid_boolean",
        })
        .expect(400);
    });

    it("returns 404 not found", async () => {
      await supertest(app)
        .get(USUARIO_ROUTE)
        .query({
          idUsuario: 999999,
        })
        .expect(404);
    });

    it("returns 200 ok query", async () => {
      await supertest(app)
        .get(USUARIO_ROUTE)
        .query({
          idUsuario: user2_id,
        })
        .expect(200);
    });
    it("returns 200 ok bearer", async () => {
      await supertest(app)
        .get(USUARIO_ROUTE)
        .set("Authorization", `Bearer ${bearer}`)
        .expect(200);
    });
  });

  // creo audio publico y audio privado, creo otro publico que 
  // sea podcast, x ejemplo, linkado a user1 y user2 uno de ellos
  // si pongo parametro de query deberia devolver solo el publico,
  // si pongo user3 no deberia devolver ningun audio
  describe(`GET ${USUARIO_AUDIO_ROUTE}`, () => {
    it("returns 400 bad params", async () => {
      await supertest(app)
        .get(USUARIO_AUDIO_ROUTE)
        .query({
          idUsuario: "invalid_number",
          podcasts: "invalid_boolean",
        })
        .expect(400);
    });
  
    it("returns 200 ok bearer no filter", async () => {
      const response = await supertest(app)
        .get(USUARIO_AUDIO_ROUTE)
        .set("Authorization", `Bearer ${bearer}`)
        .expect(200);
      const { cancion, podcast } = response.body;
      expect(cancion.length).toBe(2);
      expect(podcast.length).toBe(1);
    });

    it("returns 200 ok bearer with filter", async () => {
      const response = await supertest(app)
        .get(USUARIO_AUDIO_ROUTE)
        .query({
          idUsuario: user1_id,
          canciones: "true",
        })
        .expect(200);
      
      const { cancion, podcast } = response.body;
      expect(cancion.length).toBe(2);
      expect(podcast.length).toBe(0);
    });

    it("returns 200 ok query audio belongs to user", async () => {
      const response = await supertest(app)
        .get(USUARIO_AUDIO_ROUTE)
        .query({
          idUsuario: user2_id,
        })
        .expect(200);
      
      const { cancion, podcast } = response.body;
      expect(cancion.length).toBe(1);
      expect(podcast.length).toBe(0);
    });

    it("returns 200 ok query user does not have audios", async () => {
      const response = await supertest(app)
        .get(USUARIO_AUDIO_ROUTE)
        .query({
          idUsuario: user3_id,
        })
        .expect(200);
      
      const { cancion, podcast } = response.body;
      expect(cancion.length).toBe(0);
      expect(podcast.length).toBe(0);
    });
  });

  describe(`PUT ${USUARIO_ROUTE}`, () => {
    // TODO: AUDIO PRISMA PARA CREAR AUDIO REF
    it("returns 400 bad params", async () => {
      await supertest(app)
        .put(USUARIO_ROUTE)
        .send({
          contrasegna: "password",
          imgPerfil: "img",
          idUltimoAudio: "invalid_number",
          segFinAudio: "invalid_number",
        })
        .set("Authorization", `Bearer ${bearer}`)
        .expect(400);
    });

    it("returns 401 unauthorized", async () => {
      await supertest(app)
        .put(USUARIO_ROUTE)
        .send({
          idUltimoAudio: audio_id,
          segFinAudio: 1,
        })
        .expect(401);
    });

    it("returns 201 ok", async () => {
      await supertest(app)
        .put(USUARIO_ROUTE)
        .send({
          idUltimoAudio: audio_id,
          segFinAudio: 1,
        })
        .set("Authorization", `Bearer ${bearer}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.usuario.idUltimoAudio).toEqual(audio_id);
          expect(res.body.usuario.segFinAudio).toEqual(1);
        });
    });
  });

  describe(`PUT ${USUARIO_FOLLOW_ROUTE}:seguido`, () => {
    it("returns 400 bad params", async () => {
      await supertest(app)
        .put(USUARIO_FOLLOW_ROUTE+"hola")
        .set("Authorization", `Bearer ${bearer}`)
        .expect(400);
    });

    it("returns 401 unauthorized", async () => {
      await supertest(app)
        .put(USUARIO_FOLLOW_ROUTE+"11")
        .expect(401);
    });

    it("returns 404 followed user not found", async () => {
      await supertest(app)
        .put(USUARIO_FOLLOW_ROUTE+"9999999")
        .set("Authorization", `Bearer ${bearer}`)
        .expect(404);
    });

    it("returns 201 ok", async () => {
      await supertest(app)
        .put(USUARIO_FOLLOW_ROUTE+String(user2_id))
        .set("Authorization", `Bearer ${bearer}`)
        .expect(201);
    });
  });

  describe(`PUT ${USUARIO_UNFOLLOW_ROUTE}:seguido`, () => {
    beforeAll(async () => {
      if (!user1_id || !user3_id)
        throw Error("user1_id or user3_id not defined");
      usuarioFollowPrisma(user1_id, user3_id);
    });

    it("returns 400 bad params", async () => {
      await supertest(app)
        .put(USUARIO_UNFOLLOW_ROUTE+"fjklsd")
        .set("Authorization", `Bearer ${bearer}`)
        .expect(400);
    });

    it("returns 401 unauthorized", async () => {
      await supertest(app)
        .put(USUARIO_UNFOLLOW_ROUTE+String(user3_id))
        .expect(401);
    });

    it("returns 404 followed user not found", async () => {
      await supertest(app)
        .put(USUARIO_UNFOLLOW_ROUTE+"999999")
        .set("Authorization", `Bearer ${bearer}`)
        .expect(404);
    });

    it("returns 201 ok", async () => {
      await supertest(app)
        .put(USUARIO_UNFOLLOW_ROUTE+String(user3_id))
        .set("Authorization", `Bearer ${bearer}`)
        .expect(201);
    });
  });
});
