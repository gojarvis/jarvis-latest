// @flow
var app = require('express')();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var kue = require('kue');
var ui = require('kue-ui');
import r from 'rethinkdb'

var db = require('thinky')();
GLOBAL.thinky = db;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function (req, res) {
  res.sendfile('client/src/www/index.html');
});

let p = r.connect({
  db: 'test'
});
p.then(function (connection) {

  GLOBAL.rethinkdbConnection = connection;

  var SocketManager = require('./utils/socket-manager');
  // console.log(GLOBAL.rethinkdbConnection);
  io.on('connection', function (socket) {
    GLOBAL._socket = socket;

    var socketManager = new SocketManager(socket, io);

  })

})

server.listen(3000, function () {
  console.log('listening on *:3000');
});
