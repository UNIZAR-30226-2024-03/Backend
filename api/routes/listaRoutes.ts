import express, { Express, Request, Response } from "express";
export const listaRouter = express.Router();
import * as auth from "../middleware/authenticator.js";

import * as listaController from "../controllers/listaController.js";




//[POST]/lista/ : Crea una lista nueva.
listaRouter.post("/", auth.authenticate, listaController.createLista);

//[DELETE]/lista/<idLista>/ : Borra una lista.
listaRouter.delete("/:idLista", auth.authenticate, listaController.deleteLista); 

//[PUT]/lista/<idLista>/ : Edita una lista.
listaRouter.put("/:idLista", auth.authenticate, listaController.updateLista);
// listaRouter.put("/:idLista", listaController.updateLista);

//[GET]/lista/<idLista>/ : Devuelve la información de una lista (sin audios, propietarios ni seguidores)
listaRouter.get("/:idLista", auth.optionalAuthenticate, listaController.getListaById);

//[GET]/lista/extra/Audios/<idLista>/ : Devuelve los audios de una lista.
listaRouter.get("/extra/Audios/:idLista", auth.optionalAuthenticate, listaController.getAudiosFromLista);

//[GET]/lista/extra/Propietarios/<idLista>/ : Devuelve los propietarios de una lista.
listaRouter.get("/extra/Propietarios/:idLista", auth.authenticate, listaController.getPropietariosFromLista);

//[GET]/lista/extra/Seguidores/<idLista>/ : Devuelve los seguidores de una lista.
listaRouter.get("/extra/Seguidores/:idLista", auth.authenticate, listaController.getSeguidoresFromLista);

//[GET]/lista/extra/<idLista>/ : Devuelve la información de una lista (con audios, propietarios y seguidores)
listaRouter.get("/extra/:idLista", auth.optionalAuthenticate, listaController.getListaByIdWithExtras);

//[POST]/lista/follow/<idLista>/ : Añade la lista a las seguidas por el usuario del jwt.
listaRouter.post("/follow/:idLista/", auth.authenticate, listaController.followLista);

//[DELETE]/lista/follow/<idLista>/ : Elimina la lista de las seguidas por el usuario del jwt.
listaRouter.delete("/follow/:idLista/", auth.authenticate, listaController.unfollowLista);

//[POST]/lista/audio/<idLista>/<idAudio> : Añade un audio a la lista.
listaRouter.post("/audio/:idLista/:idAudio", auth.authenticate, listaController.addAudioToLista);

//[DELETE]/lista/audio/<idLista>/<idAudio> : Elimina un audio de la lista.
listaRouter.delete("/audio/:idLista/:idAudio", auth.authenticate, listaController.deleteAudioFromLista);

//[POST]lista/collaborator/<idLista>/<idUsuario>/: Añade un colaborador a la lista.
listaRouter.post("/collaborator/:idLista/:idUsuario", auth.authenticate, listaController.addCollaboratorToLista);

//[DELETE]lista/collaborator/<idLista>/<idUsuario>/: Elimina un colaborador de la lista.
listaRouter.delete("/collaborator/:idLista/:idUsuario", auth.authenticate, listaController.deleteCollaboratorFromLista);

//[GET]listas/seguidas/<idUsuario>/: Devuelve las listas seguidas por un usuario.
listaRouter.get("/seguidas/:idUsuario", auth.authenticate, listaController.getFollowedLists);


export default listaRouter;