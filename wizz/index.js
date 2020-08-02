const port = 8000;
const webSocketServer = require('websocket').server;
const http = require('http');
const { getuid } = require('process');
const { client } = require('websocket');

// Create server
const server = http.createServer();
server.listen(port);
console.log('server is live!');
console.log(`[Listening] :: Port:${port}`);

// Create websocket server from ^
const wsServer = new webSocketServer({
  httpServer: server,
});

const clients = {};

getUniqueId = () => {
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (
    c
  ) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
};

wsServer.on('request', (request) => {
  var userId = getUniqueId();
  console.log(
    `[${new Date()}] :: Received a new connection from origin ${
      request.origin
    }.`
  );

  const connection = request.accept(null, request.origin);
  connectionMessage = JSON.stringify({ uid: userId });
  connection.sendUTF(connectionMessage);

  clients[userId] = connection;
  console.log(`::[Connected User]::  ${userId}`);
  console.log(`::[Users Connected]::`, Object.getOwnPropertyNames(clients));

  connection.on('message', (message) => {
    if (message.type == 'utf8') {
      console.log('Message', message);
      console.log(`Received Message :: ${message.utf8Data}`);

      // Send to all clients
      for (key in clients) {
        clients[key].sendUTF(message.utf8Data);
        console.log(`Sent message to: ${clients[key]}`);
      }
    }
  });

  connection.on('close', (reasonCode, description) => {
    delete clients[userId];
    console.log(
      `[${new Date()}] :: Peer ${connection.remoteAddress} disconnected.`
    );
  });
});
