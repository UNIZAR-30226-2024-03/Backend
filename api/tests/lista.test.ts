import request from 'supertest';
import app from '../app'; // Importa tu aplicación Express aquí
import * as listasDb from '../../db/listaDb.js';
import httpStatus from 'http-status';
import {
  usuarioCreatePrisma,
  usuarioDeleteEmailPrisma,
} from '../../db/usuarioDb.js';

import { 
  createAudioPrisma,
  deleteAudioPrisma,
} from '../../db/audioDb.js';

import { createUsuarioToken } from '../utils/auth/createUsuarioToken.js';
import { before } from 'node:test';
import { Lista } from '@prisma/client';

describe('Lista routes', () => {
  let userTest1_id: number | undefined = undefined;
  let userTest2_id: number | undefined = undefined;
  let userTest3_id: number | undefined = undefined;
  
  let audioTest1_id: number | undefined = undefined;
  let audioTest2_id: number | undefined = undefined;
  
  let lista: Lista | undefined = undefined;
  let listaToDeleteId: number | undefined = undefined;

  let bearer: string | undefined = undefined;

  beforeAll(async () => {
    const userTest1 = await usuarioCreatePrisma(
      'test1',
      'test1@test.com',
      'password',
    );

    const userTest2 = await usuarioCreatePrisma(
      'test2',
      'test2@test.com',
      'password',
    );

    const userTest3 = await usuarioCreatePrisma(
      'test3',
      'test3@test.com',
      'password',
    );

    const audioTest1 = await createAudioPrisma(
      'audioTest1',
      'audioTest1.mp3',
    );

    const audioTest2 = await createAudioPrisma(
      'audioTest2',
      'audioTest2.mp3',
    );


    userTest1_id = userTest1.idUsuario;
    userTest2_id = userTest2.idUsuario;
    userTest3_id = userTest3.idUsuario;

    audioTest1_id = audioTest1.idAudio;

    // Creamos un token para el usuario test1, que será el que haga las peticiones
    bearer = createUsuarioToken(userTest1); 

    // Creamos una lista para testear
    lista = await listasDb.createLista(
      'listaTest',
      'descripcion',
      true, // esPrivada
      true, //esAlbum
      'imgLista',
      'NORMAL', // tipoLista
      userTest1_id, // idCreador
      [], // Sin audios
    );
  });

  afterAll(async () => {
    await usuarioDeleteEmailPrisma('test1@test.com');
    await usuarioDeleteEmailPrisma('test2@test.com');
    await usuarioDeleteEmailPrisma('test3@test.com');
    await deleteAudioPrisma(audioTest1_id);
    await deleteAudioPrisma(audioTest2_id);

    await listasDb.deleteListaById(lista?.idLista as number);
  });

  const LISTA_ROUTE = '/lista';
  const LISTA_EXTRA = '/lista/extra';
  const LISTA_FOLLOW = '/lista/follow';
  const LISTA_AUDIO = '/lista/audio';
  const LISTA_COLLABORATOR = '/lista/collaborator';
  const LISTA_SEGUIDAS = '/listas/seguidas';


  describe(' POST /lista , createLIsta', () => {
    it('returns ' + httpStatus.BAD_REQUEST + ' when tipoLista not valido ', async () => {
      await request(app)
        .post(LISTA_ROUTE)
        .set('Authorization', `Bearer ${bearer}`)
        .send({
          nombre: 'listaTest',
          descripcion: 'descripcion',
          esPrivada: true,
          esAlbum: true,
          imgLista: 'imgLista',
          tipoLista: 'TIPO NO VALIDO',
          idCreador: userTest1_id,
          audios: [],
        })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('returns '+ httpStatus.BAD_REQUEST + ' when idCreador not valido ', async () => {
      await request(app)
        .post(LISTA_ROUTE)
        .set('Authorization', `Bearer ${bearer}`)
        .send({
          nombre: 'listaTest',
          descripcion: 'descripcion',
          esPrivada: true,
          esAlbum: true,
          imgLista: 'imgLista',
          tipoLista: 'NORMAL',
          idCreador: 999999,
          audios: [],
        })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('returns ' + httpStatus.BAD_REQUEST + ' when audios not valido ', async () => {
      await request(app)
        .post(LISTA_ROUTE)
        .set('Authorization', `Bearer ${bearer}`)
        .send({
          nombre: 'listaTest',
          descripcion: 'descripcion',
          esPrivada: true,
          esAlbum: true,
          imgLista: 'imgLista',
          tipoLista: 'NORMAL',
          idCreador: userTest1_id,
          audios: [999999],
        })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('returns ' + httpStatus.CREATED + ' when all params are ok', async () => {
      await request(app)
        .post(LISTA_ROUTE)
        .set('Authorization', `Bearer ${bearer}`)
        .send({
          nombre: 'listaTest',
          descripcion: 'descripcion',
          esPrivada: true,
          esAlbum: true,
          imgLista: 'imgLista',
          tipoLista: 'NORMAL',
          idCreador: userTest1_id,
          audios: [],
        })
        .expect((res) => {
          expect(res.body.nombre).toEqual('listaTest');
          expect(res.body.descripcion).toEqual('descripcion');
          expect(res.body.esPrivada).toEqual(true);
          expect(res.body.esAlbum).toEqual(true);
          expect(res.body.imgLista).toEqual('imgLista');
          expect(res.body.tipoLista).toEqual('NORMAL');
          expect(res.body.idCreador).toEqual(userTest1_id);

          // Guardamos el id de la lista creada para borrarla después
          listaToDeleteId = res.body.idLista;
        });
    });
  });



  describe(' DELETE /lista/:idLista , deleteLista', () => {
    it('returns ' + httpStatus.NOT_FOUND + ' when idLista not found', async () => {
      await request(app)
        .delete(`${LISTA_ROUTE}/${999999}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });

    // it('returns ' + httpStatus.UNAUTHORIZED + ' when user is not owner or admin', async () => {
    //   await request(app)
    //     .delete(`${LISTA_ROUTE}/${lista?.idLista}`)
    //     .set('Authorization', `Bearer ${createUsuarioToken({ idUsuario: userTest2_id })}`)
    //     .expect(httpStatus.UNAUTHORIZED);
    // });

    it('returns ' + httpStatus.NO_CONTENT + ' when all params are ok', async () => {
      await request(app)
        .delete(`${LISTA_ROUTE}/${listaToDeleteId}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NO_CONTENT);
    });
  });



  describe(' PUT /lista/:idLista , updateLista', () => {
    it('returns ' + httpStatus.NOT_FOUND + ' when idLista not found', async () => {
      await request(app)
        .put(`${LISTA_ROUTE}/${999999}`)
        .set('Authorization', `Bearer ${bearer}`)
        .send({
          nombre: 'listaTest',
          descripcion: 'descripcion',
          esPrivada: true,
          esAlbum: true,
          imgLista: 'imgLista',
          tipoLista: 'NORMAL',
          idCreador: userTest1_id,
          audios: [],
        })
        .expect(httpStatus.NOT_FOUND);
    });

    it('returns ' + httpStatus.BAD_REQUEST + ' when tipoLista not valido ', async () => {
      await request(app)
        .put(`${LISTA_ROUTE}/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer}`)
        .send({
          nombre: 'listaTest',
          descripcion: 'descripcion',
          esPrivada: true,
          esAlbum: true,
          imgLista: 'imgLista',
          tipoLista: 'TIPO NO VALIDO',
          idCreador: userTest1_id,
          audios: [],
        })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('returns ' + httpStatus.BAD_REQUEST + ' when idCreador not valido ', async () => {
      await request(app)
        .put(`${LISTA_ROUTE}/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer}`)
        .send({
          nombre: 'listaTest',
          descripcion: 'descripcion',
          esPrivada: true,
          esAlbum: true,
          imgLista: 'imgLista',
          tipoLista: 'NORMAL',
          idCreador: 999999,
          audios: [],
        })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('returns ' + httpStatus.BAD_REQUEST + ' when audios not valido ', async () => {
      await request(app)
        .put(`${LISTA_ROUTE}/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer}`)
        .send({
          nombre: 'listaTest',
          descripcion: 'descripcion',
          esPrivada: true,
          esAlbum: true,
          imgLista: 'imgLista',
          tipoLista: 'NORMAL',
          idCreador: userTest1_id,
          audios: [999999],
        })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('returns ' + httpStatus.BAD_REQUEST + ' when idCreador is not the owner', async () => {
      await request(app)
        .put(`${LISTA_ROUTE}/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer}`)
        .send({
          nombre: 'listaTest',
          descripcion: 'descripcion',
          esPrivada: true,
          esAlbum: true,
          imgLista: 'imgLista',
          tipoLista: 'NORMAL',
          idCreador: userTest2_id,
          audios: [],
        })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('returns ' + httpStatus.OK + ' when no audios', async () => {
      await request(app)
        .put(`${LISTA_ROUTE}/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer}`)
        .send({
          nombre: 'listaTestNoAudios',
        })
        .expect((res) => {
          expect(res.body.nombre).toEqual('listaTestNoAudios');
        });
    });

    it('returns ' + httpStatus.OK + ' when audios != []', async () => {
      await request(app)
        .put(`${LISTA_ROUTE}/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer}`)
        .send({
          audios: [audioTest1_id],
        })
        .expect((res) => {
          expect(res.body.audios).toEqual([audioTest1_id, audioTest2_id]);
        });
    });

    it('returns ' + httpStatus.OK + ' when audios=[]', async () => {
      await request(app)
        .put(`${LISTA_ROUTE}/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer}`)
        .send({
          nombre: 'listaTest',
          audios: [],
        })
        .expect((res) => {
          expect(res.body.nombre).toEqual('listaTest');
          expect(res.body.descripcion).toEqual('descripcion');
          expect(res.body.esPrivada).toEqual(true);
          expect(res.body.esAlbum).toEqual(true);
          expect(res.body.imgLista).toEqual('imgLista');
          expect(res.body.tipoLista).toEqual('NORMAL');
          expect(res.body.idCreador).toEqual(userTest1_id);
        });
    });

    it('returns ' + httpStatus.OK + ' when all params are ok', async () => {
      await request(app)
        .put(`${LISTA_ROUTE}/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer}`)
        .send({
          nombre: 'listaTest',
          descripcion: 'descripcion',
          esPrivada: true,
          esAlbum: true,
          imgLista: 'imgLista',
          tipoLista: 'NORMAL',
          audios: [],
        })
        .expect((res) => {
          expect(res.body.nombre).toEqual('listaTest');
          expect(res.body.descripcion).toEqual('descripcion');
          expect(res.body.esPrivada).toEqual(true);
          expect(res.body.esAlbum).toEqual(true);
          expect(res.body.imgLista).toEqual('imgLista');
          expect(res.body.tipoLista).toEqual('NORMAL');
          expect(res.body.idCreador).toEqual(userTest1_id);
        });
    });

  });



  describe(' GET /lista/:idLista , getListaById', () => {
    it('returns ' + httpStatus.NOT_FOUND + ' when idLista not found', async () => {
      await request(app)
        .get(`${LISTA_ROUTE}/${999999}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('returns ' + httpStatus.OK + ' when all params are ok', async () => {
      await request(app)
        .get(`${LISTA_ROUTE}/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect((res) => {
          expect(res.body.nombre).toEqual('listaTest');
          expect(res.body.descripcion).toEqual('descripcion');
          expect(res.body.esPrivada).toEqual(true);
          expect(res.body.esAlbum).toEqual(true);
          expect(res.body.imgLista).toEqual('imgLista');
          expect(res.body.tipoLista).toEqual('NORMAL');
        });
    });
  });




});
