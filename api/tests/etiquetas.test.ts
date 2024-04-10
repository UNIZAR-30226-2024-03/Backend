import supertest from "supertest";
import app from "../app";
import {
    usuarioCreatePrisma,
    usuarioDeleteEmailPrisma,
    usuarioFollowPrisma,
  } from "../../db/usuarioDb.js";
import { songsTags, podcastTags } from "../../db/etiquetasDb.js";
import { createUsuarioToken } from "../utils/auth/createUsuarioToken.js";


describe("Etiquetas routes", () => {
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

  const ETIQUETAS_ROUTE = "/etiquetas/"
  const ETIQUETAS_CANCION_ROUTE = "/etiquetas/cancion/"
  const ETIQUETAS_PODCAST_ROUTE = "/etiquetas/podcast/"

  const ETIQUETAS_ROUTE_BAD = "/etiqueta/"
  const ETIQUETAS_CANCION_ROUTE_BAD = "/etiquetas/canciones/"
  const ETIQUETAS_PODCAST_ROUTE_BAD = "/etiquetas/podcasts/"
  describe(`GET ${ETIQUETAS_ROUTE}`, () => {
    it("returns 200 ok bearer", async () => {
      await supertest(app)
        .get(ETIQUETAS_ROUTE)
        .set("Authorization", `Bearer ${bearer}`)
        .expect(200);
    });

    it("returns 200 ok bearer", async () => {
      await supertest(app)
        .get(ETIQUETAS_ROUTE)
        .expect(403);
    });

    it("returns 200 ok bearer", async () => {
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
        .expect(403);
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
        .expect(403);
    });

    it("returns 404 bad url", async () => {
      await supertest(app)
        .get(ETIQUETAS_PODCAST_ROUTE_BAD)
        .set("Authorization", `Bearer ${bearer}`)
        .expect(404);
    });
  });


});

