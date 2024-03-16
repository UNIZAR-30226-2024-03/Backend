/* import httpStatus from 'http-status';
import pick from '../utils/errorHandling/utils/pick';
import ApiError from '../utils/errorHandling/utils/ApiError';
import catchAsync from '../utils/errorHandling/utils/catchAsync';
import { Request, Response } from 'express';



//[POST]/lista/ : Crea una lista nueva.
//[DELETE]/lista/<idLista>/ : Borra una lista.
//[PUT]/lista/<idLista>/ : Edita una lista.
//[GET]/lista/<idLista>/ : Devuelve la información de una lista (audios que contiene incluidos)
///lista/follow/<idLista>/<idUsuario> : Añade la lista a las seguidas por el usuario.
///lista/unfollow/<idLista>/<idUsuario> : Elimina la lista de las seguidas por el usuario.
//[POST]/lista/audio/<idLista>/<idAudio> : Añade un audio a la lista.
//[DELETE]/lista/audio/<idLista>/<idAudio> : Elimina un audio de la lista.
///lista/add-collaborator/<idLista>/<idUsuario>/: Añade un colaborador a la lista.

export const createLista = catchAsync(async (req : Request, res : Response) => {
  const { nombre, descripcion, esPrivada, fechaUltimaMod, img, esAlbum, tipo, propietarioCreador, audios } = req.body; // No se necesita Seguidores porque al crear una lista no tiene seguidores
  const user = await listaService.createLista(nombre, descripcion, esPrivada, fechaUltimaMod, img, esAlbum, tipo, propietarioCreador, audios);
  res.status(httpStatus.CREATED).send(user);
});

export const getUsers = catchAsync(async (req : Request, res : Response) => {
  const filter = pick(req.query, ['name', 'role']); // Ponemos todos los atributos que permitimos filtrar
  const options = pick(req.query, ['sortBy', 'limit', 'page']); 
  const result = await listaService.queryUsers(filter, options);
  res.send(result);
});

export const getUser = catchAsync(async (req : Request, res : Response) => {
  const user = await listaService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

export const updateUser = catchAsync(async (req : Request, res : Response) => {
  const user = await listaService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

export const deleteUser = catchAsync(async (req : Request, res : Response) => {
  await listaService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
}); */