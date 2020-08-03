const port = 8000;
const webSocketServer = require('websocket').server;
const http = require('http');

// Create server
const server = http.createServer();
server.listen(port);
console.log('server is live!');
console.log(`:: [Listening] :: Port:${port}`);

// Create websocket server from ^
const wsServer = new webSocketServer({
  httpServer: server,
});

// Client Dictionary
var clients = {};


///////
// Declare Event Handler Methods
///////
// On Request
const requestHandler = (request) => {
  // Gereate UID
  var userId = getUniqueId();
  console.log(
    `:: [${new Date().toDateString()}] :: New connection from origin :: ${
    request.origin
    }.`
  );

  // Accept Connection
  const connection = request.accept(null, request.origin);

  // Add connection to client dictionary
  clients[userId] = { connection, user: null };

  const users = [];
  for (key in clients) {
    let client = clients[key];
    if (client.user != null)
      users.push(client.user)
  }

  // Send Connection ID back to user
  connectionMessage = JSON.stringify({ connectionId: userId, userList: users });
  connection.sendUTF(connectionMessage);

  // Log Status
  console.log(`:: [Created Connection] ::`, userId);
  console.log(`:: [Live Connections]`, Object.getOwnPropertyNames(clients));
  console.log(`:: [Users Connected] ::`, users);

  // Setup Socket Events
  connection.on('message', messageHandler);
  connection.on('close', (reasonCode, description) => closeHandler(userId, reasonCode, description));
}

// On Close
const closeHandler = (userId, reasonCode, description) => {
  let connection = { ...clients[userId] };
  delete clients[userId];
  console.log(
    `:: [${new Date().toDateString()}] :: Peer ${connection.remoteAddress} disconnected.
    \n:: [Removed Connection] :: ${userId} 
    \n:: [Description] :: ${description}`
  );
};

// On Message
const messageHandler = (message) => {
  switch (message.type) {
    case 'utf8':
      utf8MessageHandler(JSON.parse(message.utf8Data));
      break;
    default:
      badMessage(message);
  }
}

// Factory for utf8 type messages
const utf8MessageHandler = (message) => {
  if (!message.type) {
    badMessage(message);
    return;
  }

  switch (message.type) {
    case 'message':
      textMessageHandler(message);
      break;
    case 'loadUser':
      loadUser(message);
      break;
    default:
      badMessage(message);
  }
}

const textMessageHandler = (message) => {
  console.log(`:: [Received Text Message] :: `, message);

  if (message.to.length) {
    // Send to TO users
    message.to.forEach(user => {
      if (user.cid === message.from)
        return;

      clients[user.cid].connection.sendUTF(JSON.stringify(message));
      console.log(`Sent message to: [${user.un}]-${user.cid}`);
    })

    // Send back to sender
    clients[message.from].connection.sendUTF(JSON.stringify(message));
  }
  else {
    // Send to all clients
    for (key in clients) {
      clients[key].connection.sendUTF(JSON.stringify(message));
      console.log(`Sent message to: [${clients[key].user ? clients[key].user.un : 'offline user'}]-${key}`);
    }
  }

}

const loadUser = (message) => {
  clients[message.user.cid].user = message.user;
  console.log('[Loaded User]', clients[message.user.cid].user);


  const users = [];
  for (key in clients) {
    let client = clients[key];
    if (client.user != null)
      users.push(client.user)
  }

  for (key in clients) {
    clients[key].connection.sendUTF(JSON.stringify({ userList: users }));
    console.log(`Sent Updated User list to: [${clients[key].user ? clients[key].user.un : 'offline user'}]-${key}`);
  }

}
///////
///////



// Set up Request event
wsServer.on('request', requestHandler);




//////
// HELPERS
//////

const badMessage = (message) => console.log(`[Bad Message]`, message);


// UID Helper Function
const getUniqueId = () => {
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
//////