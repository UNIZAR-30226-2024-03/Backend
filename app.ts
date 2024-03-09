import express from "express";
import dotenv from "dotenv";

import usuarioRouter from './routes/usuarioRouter.js'
// AQUI IMPORTAIS
// import listaRouter from "./routes/listaRoutes.js";
// import audioRouter from "./routes/audioRoutes.js";
// import loginRouter from "./routes/loginRoutes.js";


const app = express();
dotenv.config();

// Allows parsing of json in the body of the request.
app.use(express.json());

app.use("/api/usuario", usuarioRouter);


// AQUI AÑADIS LAS RUTAS
// app.use("/api/lista", listaRouter);

// app.use("/api/audio", audioRouter);

// app.use("/api/login", loginRouter);

app.get("/", function (_req, res) {
    return res.send("Backend for Playbeat. Test1");
});



// app.use(authErrorHandler, prismaErrorHandler, generalErrorHandler);

export default app;
