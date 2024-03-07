import express from "express";
import dotenv from "dotenv";

import usuarioRouter from './routes/usuarioRouter.js'
// import generalErrorHandler from "./middleware/errorHandling/generalErrorHandler";
// import {
//     authErrorHandler,
//     prismaErrorHandler,
// } from "./middleware/errorHandling";

const app = express();
dotenv.config();

// Allows parsing of json in the body of the request.
app.use(express.json());

app.use("/api/usuario", usuarioRouter);


app.get("/", function (_req, res) {
    return res.send("Backend for Playbeat.");
});

// app.use(authErrorHandler, prismaErrorHandler, generalErrorHandler);

export default app;
