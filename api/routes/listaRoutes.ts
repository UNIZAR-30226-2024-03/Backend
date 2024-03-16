import express, { Express, Request, Response } from "express";
export const listaRouter = express.Router();

//const listaController = require("../controllers/listaController");


//[POST]/lista/ : Crea una lista nueva.
//[DELETE]/lista/<idLista>/ : Borra una lista.
//[PUT]/lista/<idLista>/ : Edita una lista.
//[GET]/lista/<idLista>/ : Devuelve la información de una lista (audios que contiene incluidos)
///lista/follow/<idLista>/<idUsuario> : Añade la lista a las seguidas por el usuario.
///lista/unfollow/<idLista>/<idUsuario> : Elimina la lista de las seguidas por el usuario.
//[POST]/lista/audio/<idLista>/<idAudio> : Añade un audio a la lista.
//[DELETE]/lista/audio/<idLista>/<idAudio> : Elimina un audio de la lista.
///lista/add-collaborator/<idLista>/<idUsuario>/: Añade un colaborador a la lista.


listaRouter.post("/lista/", (req: Request, res: Response) => {
    //listaController.createList(req, res);
});

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

  // Otra forma de hacerlo
  // router
  // .route('/:userId')
  // .get(auth('getUsers'), validate(userValidation.getUser), userController.getUser)
  // .patch(auth('manageUsers'), validate(userValidation.updateUser), userController.updateUser)
  // .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);