var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var kue = require('kue');
var ui = require('kue-ui');
import SocketManager from './utils/socket-manager';

ui.setup({
    apiURL: '/api', // IMPORTANT: specify the api url
    baseURL: '/kue', // IMPORTANT: specify the base url
    updateInterval: 5000 // Optional: Fetches new data every 5000 ms
});

app.use('/api', kue.app);
// Mount UI
app.use('/kue', ui.app);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res){
  res.sendfile('client/src/www/index.html');
});



io.on('connection', function(socket){
  socket.join('main');
  GLOBAL._socket = socket;
  var socketManager = new SocketManager(socket,io);
  io.to('main').emit('speak', 'Ready, sir');
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
