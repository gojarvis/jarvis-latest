var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var kue = require('kue');
var ui = require('kue-ui');
import r from 'rethinkdb'
var graphController = require('./controllers/graph')
var childProc = require('child_process');
import config from 'config';

let dbConfig = config.get('graph');
let userConfig = config.get('user');
let projectsPath = userConfig.projectsPath;
let rethinkConfig = config.get('rethink');

var db = require('thinky')({
  host: rethinkConfig.host || "104.131.111.80"
});


global.thinky = db;



setTimeout(()=>{


  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


  app.get('/', function(req, res){
    res.sendFile('client/src/www/index.html');
  });

  app.get('/users', graphController.getUsers);

  app.post('/open', function(req, res){
    let address = req.param('address');
    let type = req.param('type');
    let cmd;
    switch(type){
      case 'url':
        cmd = 'open -a "Google Chrome" ' + address;
        break;
      case 'file':
        cmd = 'open -a "Atom" ' + projectsPath + address;
      break;
    }
    console.log('Executing', cmd);
    childProc.exec(cmd, function(){});


  });

  app.post('/health', function(req,res){
    res.json({'status' : 'healthy'});
  });

  app.post('/query', graphController.query);


  let p = r.connect({host: rethinkConfig.host || "104.131.111.80", db: rethinkConfig.db});
  p.then(function(connection){
    console.log('HELLO I CONNECTED TO ', rethinkConfig);
    global.rethinkdbConnection = connection;

    var SocketManager =  require('./utils/socket-manager');
    // console.log(global.rethinkdbConnection);
    io.on('connection', function(socket){
      global._socket = socket;
      var socketManager = new SocketManager(socket,io);
    });

  })

  http.listen(3000, function(){
    console.log('CONFIG', dbConfig, userConfig, rethinkConfig);
    console.log('listening on *:3000');
  });
}, 1000);
