import request from 'supertest';
import app from '../app'; // Importa tu aplicación Express aquí
import * as listasDb from '../../db/listaDb.js';
import {createDefaultListas} from '../controllers/authController.js';
import httpStatus from 'http-status';
import {
  usuarioCreatePrisma,
  usuarioDeleteEmailPrisma,
} from '../../db/usuarioDb.js';

import { 
  createAudioDB,
  deleteAudioById,
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
  let listaPub: Lista | undefined = undefined;
  let listaToDeleteId: number | undefined = undefined;
  let listaFavsUser1: Lista | null = null;

  let bearer: string | undefined = undefined;
  let bearer2: string | undefined = undefined;
  let bearer3: string | undefined = undefined;

  beforeAll(async () => {
    const userTest1 = await usuarioCreatePrisma(
      'test1',
      'test1@test.com',
      'password'
    );

    // Como no se ha hecho la petición a la API de auth para registrar el user sino que se
    // ha creado directamente en la base de datos, no se han creado las listas por defecto
    let listasDefault = await createDefaultListas(userTest1.idUsuario);
    listaFavsUser1 = listasDefault[0];


    const userTest2 = await usuarioCreatePrisma(
      'test2',
      'test2@test.com',
      'password'
    );

    const userTest3 = await usuarioCreatePrisma(
      'test3',
      'test3@test.com',
      'password'
    );

    const audioTest1 = await createAudioDB(
      'audioTest1',
      'pathTest1.mp3',
      120,
      new Date('2022-01-01').toISOString(),
      false,
      true, // esPrivada
      [userTest1.idUsuario],
      'imgAudio',
      false
    );

    const audioTest2 = await createAudioDB(
      'audioTest2',
      'pathTest2.mp3',
      122,
      new Date('2022-01-01').toISOString(),
      false,
      false,
      [userTest2.idUsuario],
      'imgAudio2',
      true
    );

    userTest1_id = userTest1.idUsuario;
    userTest2_id = userTest2.idUsuario;
    userTest3_id = userTest3.idUsuario;

    audioTest1_id = audioTest1.idAudio;
    audioTest2_id = audioTest2.idAudio;

    // Creamos un token para cada usuario para simular la sesión de cada uno
    bearer = createUsuarioToken(userTest1); 
    bearer2 = createUsuarioToken(userTest2);
    bearer3 = createUsuarioToken(userTest3);
    // Creamos una lista para testear
    lista = await listasDb.createLista(
      'listaTest',
      'descripcion',
      true, // esPrivada
      true, //esAlbum
      'imgLista',
      'NORMAL', // tipoLista
      userTest1_id, // idUsuario
      [audioTest1_id, audioTest2_id] // Un audio privado y uno público
    );

    listaPub = await listasDb.createLista(
      'listaTestPub',
      'descripcion',
      false, // esPrivada
      true, //esAlbum
      'imgLista',
      'NORMAL', // tipoLista
      userTest1_id, // idUsuario
      [audioTest1_id, audioTest2_id] // Un audio privado y uno público
    );}
  , 10000);

  afterAll(async () => {
    await usuarioDeleteEmailPrisma('test1@test.com');
    await usuarioDeleteEmailPrisma('test2@test.com');
    await usuarioDeleteEmailPrisma('test3@test.com');
    await deleteAudioById(audioTest1_id ?? 0);
    await deleteAudioById(audioTest2_id ?? 0);

    await listasDb.deleteListaById(lista?.idLista as number);
    await listasDb.deleteListaById(listaPub?.idLista as number);
  });

  const LISTA_ROUTE = '/lista';
  const LISTA_EXTRA = '/lista/extra';
  const LISTA_FOLLOW = '/lista/follow';
  const LISTA_AUDIO = '/lista/audio';
  const LISTA_COLLABORATOR = '/lista/collaborator';
  const LISTA_SEGUIDAS = '/lista/seguidas';
  const LISTA_OWNED = '/lista/owned';


  describe(' POST /lista , createLista', () => {
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
          audios: [audioTest1_id],
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
          audios: [audioTest1_id, audioTest2_id],
        })
        .expect((res) => {
          expect(res.body.nombre).toEqual('listaTest');
          expect(res.body.descripcion).toEqual('descripcion');
          expect(res.body.esPrivada).toEqual(true);
          expect(res.body.esAlbum).toEqual(true);
          expect(res.body.imgLista).toEqual('imgLista');
          expect(res.body.tipoLista).toEqual('NORMAL');

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

    it('returns ' + httpStatus.UNAUTHORIZED + ' when user is not owner or admin', async () => {
      await request(app)
        .delete(`${LISTA_ROUTE}/${listaToDeleteId}`)
        .set('Authorization', `Bearer ${bearer2}`)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('returns ' + httpStatus.OK + ' when lista has more than one owner', async () => {
      // Añadimos un colaborador a la lista
      await request(app)
        .post(`${LISTA_COLLABORATOR}/${listaToDeleteId}/${userTest2_id}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.OK);

      await request(app)
        .delete(`${LISTA_ROUTE}/${listaToDeleteId}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.OK);

      // Comprobamos que la lista sigue existiendo pero sin el usuario 1 como propietario
      // y sin el audio1 que era privado y solo lo tenía el usuario 1
      await request(app)
        .get(`${LISTA_EXTRA}/Audios/${listaToDeleteId}`)
        .set('Authorization', `Bearer ${bearer2}`)
        .expect((res) => {
          expect(res.status).toEqual(httpStatus.OK);
          expect(res.body.length).toEqual(1);
        });
    }, 10000);


    it('returns ' + httpStatus.NO_CONTENT + ' when all params are ok', async () => {
      await request(app)
        .delete(`${LISTA_ROUTE}/${listaToDeleteId}`)
        .set('Authorization', `Bearer ${bearer2}`)
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
          audios: [999999],
        })
        .expect(httpStatus.BAD_REQUEST);
    });


    it('returns ' + httpStatus.OK + ' and correct result when no audios', async () => {
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
        .expect(httpStatus.OK);
    });

    it('returns ' + httpStatus.OK + ' when audios=[]', async () => {
      await request(app)
        .put(`${LISTA_ROUTE}/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer}`)
        .send({
          nombre: 'listaTest',
          audios: [],
        })
        .expect(httpStatus.OK);
        
    });

    it('returns ' + httpStatus.OK + ' and correct result when all params are ok', async () => {
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
        });
    });
  })



  describe(' GET /lista/:idLista , getListaById', () => {
    it('returns ' + httpStatus.NOT_FOUND + ' when idLista not found', async () => {
      await request(app)
        .get(`${LISTA_ROUTE}/${999999}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('returns ' + httpStatus.UNAUTHORIZED + ' when lista privada and user is not owner or admin', async () => {
      await request(app)
        .get(`${LISTA_ROUTE}/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer2}`)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('returns ' + httpStatus.OK + ' and correct result when all params are ok', async () => {
      await request(app)
        .get(`${LISTA_ROUTE}/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect((res) => {
          expect(res.status).toEqual(httpStatus.OK);
          expect(res.body.nombre).toEqual('listaTest');
          expect(res.body.descripcion).toEqual('descripcion');
          expect(res.body.esPrivada).toEqual(true);
          expect(res.body.esAlbum).toEqual(true);
          expect(res.body.imgLista).toEqual('imgLista');
          expect(res.body.tipoLista).toEqual('NORMAL');
        });
    });
  });



  describe(' GET /lista/extra/:idLista , getListaByIdWithExtras', () => {
    it('returns ' + httpStatus.NOT_FOUND + ' when idLista not found', async () => {
      await request(app)
        .get(`${LISTA_EXTRA}/${999999}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });


    it('returns ' + httpStatus.UNAUTHORIZED + ' when lista privada and user is not owner or admin', async () => {
      await request(app)
        .get(`${LISTA_EXTRA}/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer2}`)
        .expect(httpStatus.UNAUTHORIZED);
    });



    it('returns ' + httpStatus.OK + ' and correct result when user not owner of private audios in list', async () => {

      await request(app)
        .get(`${LISTA_EXTRA}/${listaPub?.idLista}`)
        .set('Authorization', `Bearer ${bearer2}`)
        .expect((res) => {
          // console.log("when user not owner of private audios in list", res.body);
          expect(res.status).toEqual(httpStatus.OK);
          expect(res.body.nombre).toEqual('listaTestPub');
          expect(res.body.descripcion).toEqual('descripcion');
          expect(res.body.esPrivada).toEqual(false);
          expect(res.body.esAlbum).toEqual(true);
          expect(res.body.imgLista).toEqual('imgLista');
          expect(res.body.tipoLista).toEqual('NORMAL');

          expect(res.body.Audios.length).toEqual(1); // La lista de test tiene un audio público y uno privado
          expect(res.body.Propietarios).toBeDefined();
          expect(res.body.Seguidores).toBeDefined();
        });

    });

    it('returns ' + httpStatus.OK + ' and user is owner of private audios in list', async () => {
      await request(app)
        .get(`${LISTA_EXTRA}/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect((res) => {
          expect(res.status).toEqual(httpStatus.OK);
          expect(res.body.nombre).toEqual('listaTest');
          expect(res.body.descripcion).toEqual('descripcion');
          expect(res.body.esPrivada).toEqual(true);
          expect(res.body.esAlbum).toEqual(true);
          expect(res.body.imgLista).toEqual('imgLista');
          expect(res.body.tipoLista).toEqual('NORMAL');
          
          expect(res.body.Audios.length).toEqual(2); // La lista de test tiene un audio que se ha añadido al crearla
          expect(res.body.Propietarios).toBeDefined();
          expect(res.body.Seguidores).toBeDefined();
        });
    });
  });




  describe(' GET /lista/extra/Audios/:idLista , getAudiosFromLista', () => {
    it('returns ' + httpStatus.NOT_FOUND + ' when idLista not found', async () => {
      await request(app)
        .get(`${LISTA_EXTRA}/Audios/${999999}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('returns ' + httpStatus.UNAUTHORIZED + ' when lista privada and user is not owner or admin', async () => {
      await request(app)
        .get(`${LISTA_EXTRA}/Audios/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer2}`)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('returns ' + httpStatus.OK + ' and correct result when user not owner of audio privado', async () => {
      await request(app)
        .get(`${LISTA_EXTRA}/Audios/${listaPub?.idLista}`)
        .set('Authorization', `Bearer ${bearer2}`)
        .expect((res) => {
          // console.log("when user not owner of audio privado", res.body);
          expect(res.status).toEqual(httpStatus.OK);
          expect(res.body.length).toEqual(1);
        });
    });

    it('returns ' + httpStatus.OK + ' and correct result when user is owner of audio privado', async () => {
      await request(app)
        .get(`${LISTA_EXTRA}/Audios/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect((res) => {
          expect(res.status).toEqual(httpStatus.OK);
          expect(res.body.length).toEqual(2);
        });
    });

  });



  describe(' GET /lista/extra/Propietarios/:idLista , getPropietariosFromLista', () => {
    it('returns ' + httpStatus.NOT_FOUND + ' when idLista not found', async () => {
      await request(app)
        .get(`${LISTA_EXTRA}/Propietarios/${999999}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('returns ' + httpStatus.UNAUTHORIZED + ' when lista privada and user is not owner or admin', async () => {
  
      await request(app)
        .get(`${LISTA_EXTRA}/Propietarios/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer2}`)
        .expect(httpStatus.UNAUTHORIZED);
      
    });

    it('returns ' + httpStatus.OK + ' when all params are ok', async () => {
      await request(app)
        .get(`${LISTA_EXTRA}/Propietarios/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect((res) => {
          expect(res.body).toEqual([userTest1_id]);
        });
    });
  });



  describe(' GET /lista/extra/Seguidores/:idLista , getSeguidoresFromLista', () => {
    it('returns ' + httpStatus.NOT_FOUND + ' when idLista not found', async () => {
      await request(app)
        .get(`${LISTA_EXTRA}/Seguidores/${999999}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('returns ' + httpStatus.UNAUTHORIZED + ' when lista privada and user is not owner or admin', async () => {
      await request(app)
        .get(`${LISTA_EXTRA}/Seguidores/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer2}`)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('returns ' + httpStatus.OK + ' and correct result when all params are ok', async () => {
      await request(app)
        .get(`${LISTA_EXTRA}/Seguidores/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect((res) => {
          expect(res.body).toEqual([]);
        });
    });
  });




  describe(' POST /lista/follow/:idLista , followLista', () => {
    it('returns ' + httpStatus.NOT_FOUND + ' when idLista not found', async () => {
      await request(app)
        .post(`${LISTA_FOLLOW}/${999999}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('returns ' + httpStatus.UNAUTHORIZED + ' when lista privada and user is not owner or admin', async () => {
      await request(app)
        .post(`${LISTA_FOLLOW}/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer2}`)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('returns ' + httpStatus.CREATED + ' and correct result when all params are ok', async () => {
      await request(app)
        .post(`${LISTA_FOLLOW}/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect((res) => {
          expect(res.body.idUsuario).toEqual(userTest1_id);
          expect(res.body.idLista).toEqual(lista?.idLista);
          expect(res.status).toEqual(httpStatus.CREATED);
        });
    });
  });



  describe(' DELETE /lista/follow/:idLista , unfollowLista', () => {
    it('returns ' + httpStatus.NOT_FOUND + ' when idLista not found', async () => {
      await request(app)
        .delete(`${LISTA_FOLLOW}/${999999}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('returns ' + httpStatus.BAD_REQUEST + ' when user not following that lista', async () => {
      await request(app)
        .delete(`${LISTA_FOLLOW}/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer3}`)
        .expect(httpStatus.BAD_REQUEST);
    });

    // Probar a eliminar una lista con más propietarios

    it('returns ' + httpStatus.NO_CONTENT + ' when all params are ok', async () => {
      await request(app)
        .delete(`${LISTA_FOLLOW}/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NO_CONTENT);
    });
  });



  describe(' POST /lista/audio/:idLista/:idAudio , addAudioToLista', () => {
    it('returns ' + httpStatus.NOT_FOUND + ' when idLista not found', async () => {
      await request(app)
        .post(`${LISTA_AUDIO}/${999999}/${audioTest1_id}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('returns ' + httpStatus.NOT_FOUND + ' when idAudio not found', async () => {
      await request(app)
        .post(`${LISTA_AUDIO}/${lista?.idLista}/${999999}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('returns ' + httpStatus.UNAUTHORIZED + ' when user is not owner or admin', async () => {
      await request(app)
        .post(`${LISTA_AUDIO}/${lista?.idLista}/${audioTest1_id}`)
        .set('Authorization', `Bearer ${bearer2}`)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('returns ' + httpStatus.CREATED + ' when audio privado', async () => {
      await request(app)
        .post(`${LISTA_AUDIO}/${lista?.idLista}/${audioTest1_id}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.CREATED);
    });

    it('returns ' + httpStatus.CREATED + ' when audio publico', async () => {
      await request(app)
        .post(`${LISTA_AUDIO}/${lista?.idLista}/${audioTest2_id}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.CREATED);
    });
  });



  describe(' DELETE /lista/audio/:idLista/:idAudio , deleteAudioFromLista', () => {
    it('returns ' + httpStatus.NOT_FOUND + ' when idLista not found', async () => {
      await request(app)
        .delete(`${LISTA_AUDIO}/${999999}/${audioTest1_id}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('returns ' + httpStatus.NOT_FOUND + ' when idAudio not found', async () => {
      await request(app)
        .delete(`${LISTA_AUDIO}/${lista?.idLista}/${999999}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('returns ' + httpStatus.UNAUTHORIZED + ' when user is not owner or admin', async () => {
      await request(app)
        .delete(`${LISTA_AUDIO}/${lista?.idLista}/${audioTest1_id}`)
        .set('Authorization', `Bearer ${bearer2}`)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('returns ' + httpStatus.NO_CONTENT + ' when audio privado', async () => {
      await request(app)
        .delete(`${LISTA_AUDIO}/${lista?.idLista}/${audioTest1_id}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NO_CONTENT);
    });

    it('returns ' + httpStatus.NO_CONTENT + ' when audio publico', async () => {
      await request(app)
        .delete(`${LISTA_AUDIO}/${lista?.idLista}/${audioTest2_id}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NO_CONTENT);
    });
  });



  describe(' POST /lista/collaborator/:idLista/:idUsuario , addCollaboratorToLista', () => {
    it('returns ' + httpStatus.NOT_FOUND + ' when idLista not found', async () => {
      await request(app)
        .post(`${LISTA_COLLABORATOR}/${999999}/${userTest2_id}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('returns ' + httpStatus.NOT_FOUND + ' when idUsuario not found', async () => {
      await request(app)
        .post(`${LISTA_COLLABORATOR}/${lista?.idLista}/${999999}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });


    it('returns ' + httpStatus.OK + ' and correct result when all params are ok', async () => {
      await request(app)
        .post(`${LISTA_COLLABORATOR}/${lista?.idLista}/${userTest2_id}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect((res) => {
          expect(res.body.idLista).toEqual(lista?.idLista);
        });
    });
  });


  describe(' DELETE /lista/collaborator/:idLista/:idUsuario , deleteCollaboratorFromLista', () => {
    it('returns ' + httpStatus.NOT_FOUND + ' when idLista not found', async () => {
      await request(app)
        .delete(`${LISTA_COLLABORATOR}/${999999}/${userTest2_id}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('returns ' + httpStatus.NOT_FOUND + ' when idUsuario not found', async () => {
      await request(app)
        .delete(`${LISTA_COLLABORATOR}/${lista?.idLista}/${999999}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('returns ' + httpStatus.UNAUTHORIZED + ' when user is not owner or admin', async () => {
      await request(app)
        .delete(`${LISTA_COLLABORATOR}/${lista?.idLista}/${userTest3_id}`)
        .set('Authorization', `Bearer ${bearer3}`)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('returns ' + httpStatus.OK + ' when all params are ok', async () => {
      await request(app)
        .delete(`${LISTA_COLLABORATOR}/${lista?.idLista}/${userTest2_id}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.OK);
    });
  });



  describe(' GET /lista/seguidas/:idUsuario , getFollowedLists', () => {
    it('returns ' + httpStatus.NOT_FOUND + ' when idUsuario not found', async () => {
      await request(app)
        .get(`${LISTA_SEGUIDAS}/${999999}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('returns ' + httpStatus.OK + ' and correct result when no listas followed', async () => {
      await request(app)
        .get(`${LISTA_SEGUIDAS}/${userTest1_id}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect((res) => {
          expect(res.status).toEqual(httpStatus.OK);
          expect(res.body).toEqual([]);
        });
    });

    it('returns ' + httpStatus.OK + ' and correct result when private listas followed and is owner', async () => {
      // Hacemos que el usuario 1 siga la lista
      await request(app)
        .post(`${LISTA_FOLLOW}/${lista?.idLista}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect((res) => {
          expect(res.status).toEqual(httpStatus.CREATED)
          expect(res.body.idLista).toEqual(lista?.idLista);
        }
      );
      
      await request(app)
        .get(`${LISTA_SEGUIDAS}/${userTest1_id}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect((res) => {
          expect(res.body[0].idLista).toEqual(lista?.idLista);
        }
      );
    });

    it('returns ' + httpStatus.OK + ' and correct result when private listas followed and is not owner', async () => {
      // Hacemos que el usuario 2 siga la lista
      await request(app)
        .get(`${LISTA_SEGUIDAS}/${userTest1_id}`)
        .set('Authorization', `Bearer ${bearer2}`)
        .expect((res) => {
          expect(res.body.length).toEqual(1);
        }
      );
    });
  });



  describe(' GET /lista/owned/:idUsuario , getListasByUser', () => {
    it('returns ' + httpStatus.NOT_FOUND + ' when idUsuario not found', async () => {
      await request(app)
        .get(`${LISTA_OWNED}/${999999}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('returns ' + httpStatus.OK + ' and correct result when no listas owned', async () => {
      await request(app)
        .get(`${LISTA_OWNED}/${userTest2_id}`)
        .set('Authorization', `Bearer ${bearer2}`)
        .expect((res) => {
          expect(res.body).toEqual([]);
          expect(res.status).toEqual(httpStatus.OK);
        });
    });

    it('returns ' + httpStatus.OK + ' and correct result when private listas owned and user is owner', async () => {
      await request(app)
        .get(`${LISTA_OWNED}/${userTest1_id}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect((res) => {
          expect(res.status).toEqual(httpStatus.OK);
          expect(res.body.length).toEqual(2 + 3);
          expect(res.status).toEqual(httpStatus.OK);
        });
    });

    it('returns ' + httpStatus.OK + ' and correct result when private listas owned and user is not owner', async () => {
      await request(app)
        .get(`${LISTA_OWNED}/${userTest1_id}`)
        .set('Authorization', `Bearer ${bearer2}`)
        .expect((res) => {
          expect(res.status).toEqual(httpStatus.OK);
          expect(res.body.length).toEqual(1);
          expect(res.body[0].idLista).toEqual(listaPub?.idLista);
          expect(res.status).toEqual(httpStatus.OK);
        });
    });
  });


  describe(' POST /lista/favorites/:idAudio , addAudioToFavorites', () => {
    it('returns ' + httpStatus.NOT_FOUND + ' when idAudio not found', async () => {
      await request(app)
        .post(`${LISTA_ROUTE}/favorites/${999999}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('returns ' + httpStatus.CREATED + ' and correct result when all params are ok', async () => {
      await request(app)
        .post(`${LISTA_ROUTE}/favorites/${audioTest1_id}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect((res) => {
          expect(res.body.idLista).toEqual(listaFavsUser1?.idLista);
          expect(res.status).toEqual(httpStatus.CREATED);
        });
    });
  });

  describe(' DELETE /lista/favorites/:idAudio , deleteAudioFromFavorites', () => {
    it('returns ' + httpStatus.NOT_FOUND + ' when idAudio not found', async () => {
      await request(app)
        .delete(`${LISTA_ROUTE}/favorites/${999999}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('returns ' + httpStatus.NO_CONTENT + ' and correct result when all params are ok', async () => {
      await request(app)
        .delete(`${LISTA_ROUTE}/favorites/${audioTest1_id}`)
        .set('Authorization', `Bearer ${bearer}`)
        .expect(httpStatus.NO_CONTENT);
    });
  });


});
