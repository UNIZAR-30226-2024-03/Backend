import express, { Express, Request, Response } from "express";
export const listaRouter = express.Router();

const listaController = require("../controllers/listaController");




//[POST]/lista/ : Crea una lista nueva.
listaRouter.post("/", (req: Request, res: Response) => {
    listaController.createList(req, res);
});

//[DELETE]/lista/<idLista>/ : Borra una lista.
listaRouter.delete("/:idLista", (req: Request, res: Response) => {
    listaController.deleteList(req, res);
}
);

//[PUT]/lista/<idLista>/ : Edita una lista.
listaRouter.put("/:idLista", (req: Request, res: Response) => {
    listaController.updateList(req, res);
}
);

//[GET]/lista/<idLista>/ : Devuelve la información de una lista (audios que contiene incluidos)
listaRouter.get("/:idLista", (req: Request, res: Response) => {
    listaController.getList(req, res);
}
);

//[POST]/lista/follow/<idLista>/<idUsuario> : Añade la lista a las seguidas por el usuario.
listaRouter.post("/follow/:idLista/:idUsuario", (req: Request, res: Response) => {
    listaController.followList(req, res);
}
);

//[DELETE]/lista/follow/<idLista>/<idUsuario> : Elimina la lista de las seguidas por el usuario.
listaRouter.delete("/follow/:idLista/:idUsuario", (req: Request, res: Response) => {
    listaController.unfollowList(req, res);
}
);

//[POST]/lista/audio/<idLista>/<idAudio> : Añade un audio a la lista.
listaRouter.post("/audio/:idLista/:idAudio", (req: Request, res: Response) => {
    listaController.addAudio(req, res);
}
);

//[DELETE]/lista/audio/<idLista>/<idAudio> : Elimina un audio de la lista.
listaRouter.delete("/audio/:idLista/:idAudio", (req: Request, res: Response) => {
    listaController.deleteAudio(req, res);
}
);

///[POST]lista/collaborator/<idLista>/<idUsuario>/: Añade un colaborador a la lista.
listaRouter.post("/collaborator/:idLista/:idUsuario", (req: Request, res: Response) => {
    listaController.addCollaborator(req, res);
}
);

///[DELETE]lista/collaborator/<idLista>/<idUsuario>/: Elimina un colaborador de la lista.
listaRouter.delete("/collaborator/:idLista/:idUsuario", (req: Request, res: Response) => {
    listaController.deleteCollaborator(req, res);
}
);

///[GET]listas/seguidas/<idUsuario>/: Devuelve las listas seguidas por un usuario.
listaRouter.get("/listas/seguidas/:idUsuario", (req: Request, res: Response) => {
    listaController.getFollowedLists(req, res);
}
);


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