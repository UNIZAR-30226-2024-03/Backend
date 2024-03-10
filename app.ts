import express from "express";
import dotenv from "dotenv";
import cors from 'cors'; //middleware para permitir solicitudes desde cualquier origen


//import usuarioRouter from './routes/usuarioRouter.js'
// AQUI IMPORTAIS
// import listaRouter from "./routes/listaRoutes.js";
// import loginRouter from "./routes/loginRoutes.js";
import { audioRouter } from "./routes/audioRoutes.js";
const app = express();

dotenv.config();

// Allows parsing of json in the body of the request.
app.use(express.json());
app.use(cors()); // Permitir solicitudes desde cualquier origen


//app.use("/api/usuario", usuarioRouter);


// AQUI AÑADIS LAS RUTAS
// app.use("/api/lista", listaRouter);

// app.use("/api/audio", audioRouter);

// app.use("/api/login", loginRouter);

app.use("/audio", audioRouter);

app.get("/", function (_req, res) {
    return res.send("Backend for Playbeat. Test5");
});







// app.use(authErrorHandler, prismaErrorHandler, generalErrorHandler);

export default app;
