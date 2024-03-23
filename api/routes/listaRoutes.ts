import express, { Express, Request, Response } from "express";
export const listaRouter = express.Router();

import * as listaController from "../controllers/listaController.js";




//[POST]/lista/ : Crea una lista nueva.
listaRouter.post("/", listaController.createLista);

//[DELETE]/lista/<idLista>/ : Borra una lista.
listaRouter.delete("/:idLista", listaController.deleteLista);

//[PUT]/lista/<idLista>/ : Edita una lista.
listaRouter.put("/:idLista", listaController.updateLista);

//[GET]/lista/<idLista>/ : Devuelve la información de una lista (audios que contiene incluidos)
listaRouter.get("/:idLista", listaController.getListaById);

//[POST]/lista/follow/<idLista>/<idUsuario> : Añade la lista a las seguidas por el usuario.
listaRouter.post("/follow/:idLista/:idUsuario", listaController.followLista);

//[DELETE]/lista/follow/<idLista>/<idUsuario> : Elimina la lista de las seguidas por el usuario.
listaRouter.delete("/follow/:idLista/:idUsuario", listaController.unfollowLista);

//[POST]/lista/audio/<idLista>/<idAudio> : Añade un audio a la lista.
listaRouter.post("/audio/:idLista/:idAudio", listaController.addAudioToLista);

//[DELETE]/lista/audio/<idLista>/<idAudio> : Elimina un audio de la lista.
listaRouter.delete("/audio/:idLista/:idAudio", listaController.deleteAudioFromLista);

//[POST]lista/collaborator/<idLista>/<idUsuario>/: Añade un colaborador a la lista.
listaRouter.post("/collaborator/:idLista/:idUsuario", listaController.addCollaboratorToLista);

//[DELETE]lista/collaborator/<idLista>/<idUsuario>/: Elimina un colaborador de la lista.
listaRouter.delete("/collaborator/:idLista/:idUsuario", listaController.deleteCollaboratorFromLista);

//[GET]listas/seguidas/<idUsuario>/: Devuelve las listas seguidas por un usuario.
listaRouter.get("/seguidas/:idUsuario", listaController.getFollowedLists);



// Ejemplo de endpoint para probar el funcionamiento de la API
// [POST] /lista/calc
listaRouter.post('/calc', (req: Request, res: Response): void => {
  const { a, b } = req.body;

  if (a && b && typeof a === 'number' && typeof b === 'number') {
    res.json({
      success: true,
      message: a + b,
    });
  } else {
    res.json({
      success: false,
      message: 'Missing parameters',
    });
  }
});

  export default listaRouter;