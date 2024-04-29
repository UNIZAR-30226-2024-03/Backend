import app from "../api/app.js";
import https from "http";  // Cambiar a https
import { Server } from "socket.io"
import * as usuarioDatabase from "../db/usuarioDb.js";
import jwtws from "jsonwebtoken";

const httpsServer = https.createServer(app);

export const io = new Server(httpsServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "OPTIONS"]
  }
});

function authenticateWS(token: string) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET missing in environment.");
    }
    // Verificar el token
    const payload = jwtws.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] }) as jwtws.JwtPayload;

    // Si la verificación es exitosa, devolver true
    console.log("Token verificado: " + JSON.stringify(payload));
    return payload.idUsuario;
  } catch (err) {
    // Si la verificación falla, devolver false
    return null;
  }
}


httpsServer.listen(3001, () => console.log("WS.io server started on port 3001"));

//WS
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on('join', (message) => {
    try{
      message = JSON.parse(message);
      if (('JWT' in message) && ('room' in message)) {
        console.log("Mensaje recibido: "+message.JWT+" a la sala: "+message.room);
        const idUsuario = authenticateWS(message.JWT);
        console.log(idUsuario);
        if(idUsuario != null){
          console.log(`Socket ${socket.id} joining ${message.room}`);
          socket.join(message.room);
        }else{
          console.log(`Socket ${socket.id} no autorizado, `+message.JWT+" no es un token valido, "+message.room);
        }
      }
    }catch(e){
      console.log(e);
    }

 });
 
  socket.on('message', (message) => {
    try{
      message = JSON.parse(message);
      if (('JWT' in message) && ('room' in message) && ('message' in message)) {
        const idUsuario = authenticateWS(message.JWT);
        console.log(idUsuario);
        if(idUsuario != null){
          console.log('Mensaje recibido a la sala: '+message.room+' desde el socket: '+socket.id);

          //broadcast a todos los sockets en la sala, incluyendo el que envió el mensaje
          io.to(message.room).emit('message', 'Mensaje recibido: ' + message);
        }else{
          console.log(`Socket ${socket.id} no autorizado, `+message.JWT+" no es un token valido, "+message.room);
        }
      }else{
        console.log('Faltan parametros en el mensaje');
      }
    }catch(e){
      console.log(e);
    }
  });

  socket.on('reload', (message) => {
    try {
      message = JSON.parse(message);
      if (('JWT' in message) && ('room' in message) ) {
        const idUsuario = authenticateWS(message.JWT);
        console.log(idUsuario);
        if(idUsuario != null){
          console.log('Recargar la sala: '+message.room);
          io.to(message.room).emit('reload', 'actualizar');
        }else{
          console.log(`Socket ${socket.id} no autorizado, `+message.JWT+" no es un token valido, "+message.room);
        
        }
      }
    } catch (e) {
      console.log(e);
    }
    
  });


  socket.on('Sync', (message, room) => {
    try{
      console.log('Mensaje recibido: "' + message+ '" a la sala: '+room);
      message = JSON.parse(message);
      if (('JWT' in message) && ('idAudio' in message) && ('currentTime' in message)) {
        const idUsuario = authenticateWS(message.JWT);
        if(idUsuario != null){
          console.log(`Vamos a modificar el usuario`, idUsuario, message.idAudio, message.currentTime);
          usuarioDatabase.usuarioModifyLastAudioPrisma(idUsuario, message.idAudio, message.currentTime);
        }else{
          console.log(`Socket ${socket.id} no autorizado, `+message.JWT+" no es un token valido, "+message.room);
        }
      }
    }catch(e){
      console.log(e);
    }

  });

  
});


