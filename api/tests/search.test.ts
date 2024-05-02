import supertest from "supertest";
import app from "../app.js";
import {
  usuarioCreatePrisma,
  usuarioDeleteEmailPrisma,

} from "../../db/usuarioDb.js";
import * as listasDb from '../../db/listaDb.js';
import * as audiosDb from '../../db/audioDb.js';
import { createUsuarioToken } from "../utils/auth/createUsuarioToken.js";

describe("Search routes", () => {
  let user1_id: number | undefined = undefined;
  let bearer: string | undefined = undefined;
  let bearer2: string | undefined = undefined;
  let lista1_publica: any;
  let lista2_privada: any;
  let album1_publico: any;
  let cancion1_publica: any;
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
    user1_id = user1.idUsuario;
    bearer = createUsuarioToken(user1);
    bearer2 = createUsuarioToken(user2);

    lista1_publica = await listasDb.createLista(
      'listaPublica 11111',
      'descripcion',
      false,
      false,
      'imgLista',
      'NORMAL',
      user1_id,
      [],
    );
    lista2_privada = await listasDb.createLista(
      'listaPrivada 22222',
      'descripcion',
      true,
      false,
      'imgLista',
      'NORMAL',
      user1_id,
      [],
    );
    album1_publico = await listasDb.createLista(
      'albumPublico 33333',
      'descripcion',
      false,
      true,
      'imgLista',
      'NORMAL',
      user1_id,
      [],
    );
    cancion1_publica = await audiosDb.createAudioDB(
      'cancionPublica 44444', 
      'pruebaTest1.mp3', 
      120, 
      new Date().toISOString(), 
      false, 
      false, 
      [user1_id],
      "prueba",
      false
    );
  });
  afterAll(async () => {
    await Promise.all([
      usuarioDeleteEmailPrisma("test@testing.com"),
      usuarioDeleteEmailPrisma("test2@testing.com"),
      listasDb.deleteListaById(lista1_publica.idLista),
      listasDb.deleteListaById(lista2_privada.idLista),
      listasDb.deleteListaById(album1_publico.idLista),
      audiosDb.deleteAudioById(cancion1_publica.idAudio),
    ]);
  });

  const SEARCH_ROUTE = "/search";

  describe(`GET ${SEARCH_ROUTE}`, () => {
    // * query con idusuario 1: devuelve 2 listas, 1 album, 1 cancino
    it("returns 200 ok query with idusuario 1", async () => {
      const response = await supertest(app)
        .get(SEARCH_ROUTE)
        .query({
          q: "l",
        })
        .set("Authorization", `Bearer ${bearer}`)
        .expect(200);
      const { usuarios, listas, canciones, albums, podcasts } = response.body;
      expect(usuarios).toHaveLength(0);
      expect(listas).toHaveLength(2);
      expect(canciones).toHaveLength(1);
      expect(albums).toHaveLength(1);
      expect(podcasts).toHaveLength(0);
    });

    // * query con idusuario 2: devuelve 1 lista, 1 album, 1 cancion
    it("returns 200 ok query with idusuario 2", async () => {
      const response = await supertest(app)
        .get(SEARCH_ROUTE)
        .set("Authorization", `Bearer ${bearer2}`)
        .query({
          q: "l",
        })
        .expect(200);

        const { usuarios, listas, canciones, albums, podcasts } = response.body;
        expect(listas).toHaveLength(1);
        expect(canciones).toHaveLength(1);
        expect(albums).toHaveLength(1);
        expect(usuarios).toHaveLength(0);
        expect(podcasts).toHaveLength(0);
      });

    // * query con idusuario1, q=44444: devuelve 1 cancion
    it("returns 200 ok query with idusuario 1 and q=44444", async () => {
      const response = await supertest(app)
        .get(SEARCH_ROUTE)
        .set("Authorization", `Bearer ${bearer}`)
        .query({
          q: "44444",
        })
        .expect(200);

        const { usuarios, listas, canciones, albums, podcasts } = response.body;
        expect(canciones).toHaveLength(1);
        expect(usuarios).toHaveLength(0);
        expect(listas).toHaveLength(0);
        expect(albums).toHaveLength(0);
        expect(podcasts).toHaveLength(0);
    });

    // * query con idusuario1, q=" ", lista=True: devuelve 1 cancion
    it("returns 200 ok query with idusuario 1, q=' ', and lista=True", async () => {
      const response = await supertest(app)
        .get(SEARCH_ROUTE)
        .set("Authorization", `Bearer ${bearer}`)
        .query({
          q: "l",
          lista: true,
        })
        .expect(200);

      const { usuarios, listas, canciones, albums, podcasts } = response.body;
      expect(listas).toHaveLength(2);
      expect(canciones).toHaveLength(0);
      expect(usuarios).toHaveLength(0);
      expect(albums).toHaveLength(0);
      expect(podcasts).toHaveLength(0);
    });
  });
});

/**
 */