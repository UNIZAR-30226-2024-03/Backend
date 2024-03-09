import {WebSocketServer } from "ws";
import app from "../app.js";
import http from "http";

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

server.listen(3001, () => console.log('WS server started on port 3001'));


//WS


wss.on('connection', function connection(ws) {
    console.log('New connection');
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        ws.send('Hello, client');
    });
});