import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const allUsers = await prisma.usuario.findMany()
  allUsers.forEach((user) => console.log(user.nombreUsuario))
}