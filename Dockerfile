FROM node:20 as builder

WORKDIR /app

# Copiar solo el archivo package.json para aprovechar la caché de capas de Docker
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

# Copiar el resto de los archivos del proyecto
COPY . .

# Definir las variables de entorno en tiempo de construcción
ARG DATABASE_URL
ARG PGHOST
ARG PGUSER
ARG PGPORT
ARG PGDATABASE
ARG PGPASSWORD
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG JWT_SECRET

# Establecer las variables de entorno en la imagen
ENV DATABASE_URL=$DATABASE_URL
ENV PGHOST=$PGHOST
ENV PGUSER=$PGUSER
ENV PGPORT=$PGPORT
ENV PGDATABASE=$PGDATABASE
ENV PGPASSWORD=$PGPASSWORD
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ENV JWT_SECRET=$JWT_SECRET

# Instalar dependencias
RUN npm install

# Exponer el puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
