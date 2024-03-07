import express, { Express, Request, Response } from "express";
import passport from "passport";
import "../controllers/authController.js";
import { Router } from "express";

export const loginRouter = express.Router();

// Login de usuario con cuenta especifica de PlayBeat.
loginRouter.get("/login", (req: Request, res: Response) => {
    res.send("Normal Login");
    // Regidirigimos a la página de login.
    // res.render("login");
})

loginRouter.post("login", (req: Request, res: Response) => {
    // Recogemos los datos del formulario
    const { email, password } = req.body;
    // Comprobamos que los datos existen en la base de datos.
    /*const exists = 
    if (exists) {
        // Si existe, redirigimos a la página principal.
        res.redirect("/");
    } else {    
        // Si no existe, redirigimos a la página de login.
        res.send("Credenciales incorrectas.");
        res.redirect("/login");
    }*/
})

loginRouter.get("/google", (req: Request, res: Response) => res.send(req.user));

// Aplico el middleware de passport para autenticar con Google
// solo a aquellas rutas que coincidan con "/auth-google"
loginRouter.use(
    "/auth-google", 
    passport.authenticate("auth-google", {
    scope: [
        "https://www.googleapis.com/auth/userinfo.profile", 
        "https://www.googleapis.com/auth/userinfo.email"
    ],
    session: false,
    }), 
    loginRouter);