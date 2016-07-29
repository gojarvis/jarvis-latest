var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var kue = require('kue');
var ui = require('kue-ui');
import r from 'rethinkdb'
var graphController = require('./controllers/graph.js')



var db = require('thinky')();
GLOBAL.thinky = db;

setTimeout(()=>{


  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


  app.get('/', function(req, res){
    res.sendfile('client/src/www/index.html');
  });

  app.post('/health', function(req,res){
    res.json({'foo' : 'bar'});
  });

  app.post('/query', graphController.query);


  let p = r.connect({db: 'test'});
  p.then(function(connection){

    GLOBAL.rethinkdbConnection = connection;

    var SocketManager =  require('./utils/socket-manager');
    // console.log(GLOBAL.rethinkdbConnection);
    io.on('connection', function(socket){
      GLOBAL._socket = socket;

      var socketManager = new SocketManager(socket,io);



    });

  })





  http.listen(3000, function(){
    console.log('listening on *:3000');
  });
}, 1000);
