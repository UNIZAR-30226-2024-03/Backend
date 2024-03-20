import supertest from "supertest";
import app from "../app.js";
import { usuarioDeleteEmailPrisma } from "../../db/usuarioDb.js";

describe("Auth routes", () => {
  afterAll(async () => {
    await usuarioDeleteEmailPrisma("test@testing.com");
  });

  const SIGNUP_ROUTE = "/auth/signup";
  const GOOGLE_ROUTE = "/auth/google";
  const LOGIN_ROUTE = "/auth/login";

  // LOCAL STRATEGY
  describe(`POST ${SIGNUP_ROUTE}`, () => {
    it("returns 400 invalid email", async () => {
      await supertest(app)
        .post(SIGNUP_ROUTE)
        .send({
          email: "invalid_email",
          contrasegna: "password",
          nombreUsuario: "username",
        })
        .expect(400);
    });
    it("returns 400 missing params", async () => {
      await supertest(app)
        .post(SIGNUP_ROUTE)
        .send({
          nombreUsuario: "username",
        })
        .expect(400);
    });
    it("returns 201 creation ok", async () => {
      await supertest(app)
        .post(SIGNUP_ROUTE)
        .send({
          nombreUsuario: "test",
          email: "test@testing.com",
          contrasegna: "password",
        })
        .expect(201);
    });
    it("returns 400 duplicate user", async () => {
      await supertest(app)
        .post(SIGNUP_ROUTE)
        .send({
          nombreUsuario: "test",
          email: "test@testing.com",
          contrasegna: "password",
        })
        .expect(400);
    });
  });

  // TODO: SE HA REGISTRADO CON GOOGLE
  describe(`GET ${LOGIN_ROUTE}`, () => {
    it("returns 400 invalid email", async () => {
      await supertest(app)
        .get(LOGIN_ROUTE)
        .send({
          email: "invalid_email",
          contrasegna: "password",
        })
        .expect(400);
    });
    it("returns 400 missing params", async () => {
      await supertest(app).get(LOGIN_ROUTE).send({}).expect(400);
    });
    it("returns 404 user does not exist", async () => {
      await supertest(app)
        .get(LOGIN_ROUTE)
        .send({
          email: "not_found@testing.com",
          contrasegna: "password",
        })
        .expect(404);
    });
    it("returns 401 incorrect password", async () => {
      await supertest(app)
        .get(LOGIN_ROUTE)
        .send({
          email: "test@testing.com",
          contrasegna: "incorrect_password",
        })
        .expect(401);
    });
    it("returns 200 correct login", async () => {
      await supertest(app)
        .get(LOGIN_ROUTE)
        .send({
          email: "test@testing.com",
          contrasegna: "password",
        })
        .expect(200);
    });
  });

  // GOOGLE STRATEGY
  describe(`POST ${GOOGLE_ROUTE}`, () => {});
});
