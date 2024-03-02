import express, { Express, Request, Response } from "express";
import passport from "passport";
import "../controllers/authController.js";
import { Router } from "express";

export const loginRouter = express.Router();

loginRouter.get("/google", (req, res) => res.send(req.user));

loginRouter.use(
    "/auth", 
    passport.authenticate("auth-google", {
    scope: [
        "https://www.googleapis.com/auth/userinfo.profile", 
        "https://www.googleapis.com/auth/userinfo.email"
    ],
    session: false,
    }), 
    loginRouter);