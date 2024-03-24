import supertest from "supertest";
import app from "../app.js";
import { listasDb } from "../../db/listasDb.js";
import httpStatus from "http-status";

describe("Lista Controller", () => {
  describe("POST /lista", () => {
    it("should create a new lista", async () => {
      // Mock the necessary functions from listasDb
      const createListaMock = jest.spyOn(listasDb, "createLista");
      createListaMock.mockImplementation(() => Promise.resolve({ id: 1, nombre: "Lista de prueba" }));

      // Make the request to create a new lista
      const response = await supertest(app)
        .post("/lista")
        .send({
          nombre: "Lista de prueba",
          descripcion: "Descripción de la lista",
          esPrivada: true,
          img: "imagen.jpg",
          esAlbum: false,
          tipoLista: "normal",
          idUsuario: 1,
          audios: [1, 2, 3]
        })
        .expect(httpStatus.CREATED);

      // Check that the necessary function was called with the correct parameters
      expect(createListaMock).toHaveBeenCalledWith(
        "Lista de prueba",
        false,
        true,
        1,
        "Descripción de la lista",
        "imagen.jpg",
        "normal",
        [1, 2, 3]
      );

      // Check that the response status is 201 Created
      expect(response.status).toBe(httpStatus.CREATED);
      // Check that the response body contains the created lista
      expect(response.body).toEqual({ id: 1, nombre: "Lista de prueba" });
    });

    it("should return 500 if an error occurs", async () => {
      // Mock the necessary function from listasDb to throw an error
      const createListaMock = jest.spyOn(listasDb, "createLista");
      createListaMock.mockImplementation(() => Promise.reject(new Error("Some error")));

      // Make the request to create a new lista
      const response = await supertest(app)
        .post("/lista")
        .send({
          nombre: "Lista de prueba",
          descripcion: "Descripción de la lista",
          esPrivada: true,
          img: "imagen.jpg",
          esAlbum: false,
          tipoLista: "normal",
          idUsuario: 1,
          audios: [1, 2, 3]
        })
        .expect(httpStatus.INTERNAL_SERVER_ERROR);

      // Check that the necessary function was called with the correct parameters
      expect(createListaMock).toHaveBeenCalledWith(
        "Lista de prueba",
        false,
        true,
        1,
        "Descripción de la lista",
        "imagen.jpg",
        "normal",
        [1, 2, 3]
      );

      // Check that the response status is 500 Internal Server Error
      expect(response.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});