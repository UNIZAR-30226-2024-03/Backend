// Fichero que exporta una instancia de PrismaClient para poder usarla en otros 
// ficheros PrismaClient es una clase que contiene los métodos necesarios para 
// interactuar con la base de datos


import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
