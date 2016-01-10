var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

import SocketManager from './utils/socket-manager';




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res){
  res.sendfile('client/src/www/index.html');
});



io.on('connection', function(socket){
  var socketManager = new SocketManager(socket,io)

  // app.get('/alexa', function(req,res){
  //   io.emit('speak', "AAlexa");
  //   io.emit('speak', "");
  //   io.emit('speak', "Trigger Jarvis Greeting");
  // })
  //
  // app.post('/phone', function(req,res){
  //   io.emit('speak', "Hello Phone");
  //   console.log('phone', req.body);
  // })
});



http.listen(3000, function(){
  console.log('listening on *:3000');
});
