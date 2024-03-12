import express from "express";
import dotenv from "dotenv";

import usuarioRouter from "./routes/usuarioRouter.js";
import authRouter from "./routes/authRouter.js";
import fotosRouter from "./routes/fotosRouter.js";

import prismaErrorHandler from "./utils/errorHandling/prismaErrorHandler.js";
import generalErrorHandler from "./utils/errorHandling/generalErrorHandler.js";
import zodErrorHandler from "./utils/errorHandling/zodErrorHandler.js";
import authErrorHandler from "./utils/errorHandling/authErrorHandler.js";

const app = express();
dotenv.config();

// Allows parsing of json in the body of the request.
app.use(express.json());

app.use("/api/usuario", usuarioRouter);
app.use("/api/auth", authRouter);
app.use("/api/foto", fotosRouter);

app.get("/", function (_req, res) {
  return res.send("Backend for Playbeat.");
});

app.use(authErrorHandler, prismaErrorHandler, zodErrorHandler, generalErrorHandler);

export default app;
