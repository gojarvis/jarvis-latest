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
import passport from 'passport';

let dbConfig = config.get('graph');
let userConfig = config.get('user');
let projectsPath = userConfig.projectsPath;
let rethinkConfig = config.get('rethink');
let GraphUtil = require('./utils/graph');
let graphUtil = new GraphUtil();

var db = require('thinky')({
  host: rethinkConfig.host || "104.131.111.80"
});


global.thinky = db;

/** Passport **/
var GitHubStrategy = require('passport-github').Strategy;
var GITHUB_CLIENT_ID = 'a595d84888f2d2a687a4';
var GITHUB_CLIENT_SECRET = '3279791b36883a5138acf4db4080a5982faee3d8';
passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/github/callback"
}, function(accessToken, refreshToken, profile, cb) {
  graphUtil.getSaveUserInGraph({ username: profile.username }).then((result) => {
    return cb(null, result);
  }).catch(cb);
}));

passport.serializeUser(function(user, cb) {
  console.log('serializeUser:', user);
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  console.log('deserializeUser:', user);
  cb(null, obj);
});

setTimeout(()=>{


  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // Initialize Passport and restore authentication state, if any, from the
  // session.
  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/auth/github',
    passport.authenticate('github'));

  app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      // NOTE: if we had the user object here (it's not in res.body),
      // we could encode it and append it as a query string, OR inject into the
      // session
      res.redirect('http://localhost:8888');
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
