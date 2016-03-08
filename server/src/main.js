var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var _  = require('lodash');
import SocketManager from './utils/socket-manager';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res){
  res.sendfile('client/src/www/index.html');
});

var socketManager = {};

io.on('connection', function(socket){
  socket.join('main');
  GLOBAL._socket = socket;

  if (_.isEmpty(socketManager)){
      socketManager = new SocketManager(socket,io);
  }

  io.to('main').emit('console', 'Socket connected');

});



http.listen(3000, function(){
  console.log('listening on *:3000');
});
