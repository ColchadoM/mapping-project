'use strict';
// Globals
var WebSocket = require('ws');
var WS_PORT = 1881;

var inputClients  = [];
var outputClients = [];

var id = 0;

/*****************************
 * WebSocketServer Callbacks *
 *****************************/

function onListening () {
console.log((new Date()) + ' Server is listening on port ' + WS_PORT);
}


function onConnection (connection, request) {
var ip = request.connection.remoteAddress;
console.log((new Date()) + ' Connection from ' + ip + '.');


connection.on('message', function (message) { onMessage(connection, message); });
connection.on('close', function () { onClose(connection); });
}


function onMessage (from, messageStr) {
console.log((new Date()) + ' Received Message: ' + messageStr);

var message = JSON.parse(messageStr);

if (message.type === 'register') {
onRegisterMessage(from, message);
  }

else if (message.type === 'data') {
onDataMessage(from, message);
  }
}


function onRegisterMessage (from, message) {
if (message.data === 'input') {
inputClients.push(from);
from.id = id;
    id++;

broadcast({
      type : 'newInput',
      data : from.id
    });
  } else {
outputClients.push(from);
  }
}


function onDataMessage (from, message) {
broadcast({
    type : 'data',
    data : {
      from  : from.id,
      payload : message.data
    }
  });
}


function onClose (connection) {
console.log((new Date()) + ' Peer disconnected.');

var index = inputClients.indexOf(connection);
if (index != -1) {
  broadcast({
      type : 'disconnected',
      data : connection.id
    });
    inputClients.splice(index, 1);
    return;
  }
  
  index = outputClients.indexOf(connection);
if (index != -1) {
outputClients.splice(index, 1);
return;
  }
}


function broadcast (messageToSend) {
for (var i = 0; i < outputClients.length; i++) {
var client = outputClients[i];
if (client.readyState === WebSocket.OPEN) {
client.send(JSON.stringify(messageToSend));
    }
  }
}

/***************
 * Main script *
 ***************/

var wsServer = new WebSocket.Server({
  port: WS_PORT
});
wsServer.on('listening', onListening);
wsServer.on('connection', onConnection);
