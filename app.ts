import express from "express";
import dotenv from "dotenv";

import fotosRouter from "./routes/fotosRouter.js";

import prismaErrorHandler from "./utils/errorHandling/prismaErrorHandler.js";
import generalErrorHandler from "./utils/errorHandling/generalErrorHandler.js";

const app = express();
dotenv.config();

// Allows parsing of json in the body of the request.
app.use(express.json());
app.use(prismaErrorHandler, generalErrorHandler);

app.use("/api/foto", fotosRouter);

app.get("/", function (_req, res) {
  return res.send("Backend for Playbeat.");
});

export default app;
