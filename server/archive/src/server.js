var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

import SocketManager from 'utils/socket-manager';

app.get('/', function(req, res){
  res.sendfile('client/src/www/index.html');
});

io.on('connection', function(socket){
  var socketManager = new SocketManager(socket)
});



http.listen(3000, function(){
  console.log('listening on *:3000');
});
