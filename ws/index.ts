import app from "../api/app.js";
import http from "http";
import { Server } from "socket.io";

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

httpServer.listen(3001, () => console.log("WS.io server started on port 3001"));

//WS
io.on("connection", (socket) => {

  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on('join', (room) => {
    console.log(`Socket ${socket.id} joining ${room}`);
    socket.join(room);
 });
 
  socket.on('message', (message, room) => {
    console.log('Mensaje recibido: "' + message+ '" a la sala: '+room);

    // Enviar un mensaje a todos los clientes en la sala
    socket.to(room).emit('message', 'Mensaje recibido: ' + message);
  });
});
