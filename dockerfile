FROM node:20 as builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

COPY . .

RUN npm install

VOLUME /app/audios

EXPOSE 3000
CMD ["npm", "start"]