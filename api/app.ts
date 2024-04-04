import express from "express";
import dotenv from "dotenv";
import cors from "cors"; //middleware para permitir solicitudes desde cualquier origen

import usuarioRouter from "./routes/usuarioRoutes.js";
import authRouter from "./routes/authRoutes.js";
import fotosRouter from "./routes/fotosRoutes.js";
import audioRouter from "./routes/audioRoutes.js";
import listaRouter from "./routes/listaRoutes.js";
import etiquetasRouter from "./routes/etiquetasRoutes.js";

import prismaErrorHandler from "./utils/errorHandling/prismaErrorHandler.js";
import generalErrorHandler from "./utils/errorHandling/generalErrorHandler.js";
import zodErrorHandler from "./utils/errorHandling/zodErrorHandler.js";
import authErrorHandler from "./utils/errorHandling/authErrorHandler.js";


const app = express();

dotenv.config();

// Allows parsing of json in the body of the request.
app.use(express.json());
app.use(cors()); // Permitir solicitudes desde cualquier origen

app.use("/usuario", usuarioRouter);
app.use("/auth", authRouter);
app.use("/foto", fotosRouter);
app.use("/lista", listaRouter);
app.use("/audio", audioRouter);
app.use("/etiquetas", etiquetasRouter);

app.get("/", function (_req, res) {
  return res.send("Backend for Playbeat.");
});


app.use(
  authErrorHandler,
  prismaErrorHandler,
  zodErrorHandler,
  generalErrorHandler,
);


export default app;
