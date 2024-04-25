FROM node:20 as builder

WORKDIR /app

# Copiar solo el archivo package.json para aprovechar la caché de capas de Docker
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

# Copiar el resto de los archivos del proyecto
COPY . .

# Instalar dependencias
RUN npm install

# Exponer el puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
