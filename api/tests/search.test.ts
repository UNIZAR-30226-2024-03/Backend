import supertest from "supertest";
import app from "../app.js";
import {
  usuarioCreatePrisma,
  usuarioDeleteEmailPrisma,
} from "../../db/usuarioDb.js";
import { createUsuarioToken } from "../utils/auth/createUsuarioToken.js";

describe("Search routes", () => {
  let bearer: string | undefined = undefined;
  const audio_id: number | undefined = 99;

  beforeAll(async () => {
    const user1 = await usuarioCreatePrisma(
      "test",
      "test@testing.com",
      "password",
    );
    bearer = createUsuarioToken(user1);
  });
  afterAll(async () => {
    await usuarioDeleteEmailPrisma("test@testing.com");
  });

  const SEARCH_ROUTE = "/search";

  describe(`GET ${SEARCH_ROUTE}`, () => {
    it("returns 401 unauthorized", async () => {
      await supertest(app)
        .get(SEARCH_ROUTE)
        .expect(401);
    });

    it("returns 400 missing query", async () => {
      await supertest(app)
        .get(SEARCH_ROUTE)
        .set("Authorization", `Bearer ${bearer}`)
        .expect(400);
    });

    it("returns 200 ok query", async () => {
      await supertest(app)
        .get(SEARCH_ROUTE)
        .set("Authorization", `Bearer ${bearer}`)
        .query({
          q: "test",
        })
        .expect(200);
    });
  });
});
