import supertest from "supertest";
import app from "../app.js";
import {
  usuarioCreatePrisma,
  usuarioDeleteEmailPrisma,
  usuarioFollowPrisma,
} from "../../db/usuarioDb.js";
import { createUsuarioToken } from "../utils/auth/createUsuarioToken.js";

describe("Usuario routes", () => {
  let bearer: string | undefined = undefined;
  let user1_id: number | undefined = undefined;
  let user2_id: number | undefined = undefined;
  let user3_id: number | undefined = undefined;
  const audio_id: number | undefined = 99;

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
  });
  afterAll(async () => {
    await usuarioDeleteEmailPrisma("test@testing.com");
    await usuarioDeleteEmailPrisma("test2@testing.com");
    await usuarioDeleteEmailPrisma("test3@testing.com");
  });

  const USUARIO_ROUTE = "/usuario";
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
        .put(USUARIO_FOLLOW_ROUTE+"9999999999")
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
