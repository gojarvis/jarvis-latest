let express = require('express');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let cookieSession = require('cookie-session');
let proxy = require('http-proxy-middleware');
let app = express();
let http = require('http').Server(app);
let bodyParser = require('body-parser');
let kue = require('kue');
let ui = require('kue-ui');

let rethink = require('rethinkdb');

let graphController = require('./controllers/graph')
let childProc = require('child_process');
let config = require('config');
let passport = require('passport');
let _ = require('lodash');

let path = require("path");

let isDev = process.env.JARVIS_DEV || false;

let dbConfig = config.get('graph');
let userConfig = config.get('user');
let projectsPath = userConfig.projectsPath;
let rethinkConfig = config.get('rethink');
let GraphUtil = require('./utils/graph');
let graphUtil = new GraphUtil();
let usersController = require('./controllers/users');
let teamsController = require('./controllers/teams');

let sessionData = {};


let db = require('thinky')({
  host: rethinkConfig.host || "104.131.111.80"
});

global.thinky = db;

let initialized = false;

/** Passport **/
let GitHubStrategy = require('passport-github').Strategy;
let GITHUB_CLIENT_ID = 'a595d84888f2d2a687a4';
let GITHUB_CLIENT_SECRET = '3279791b36883a5138acf4db4080a5982faee3d8';
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
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  graphUtil.getSaveUserInGraph({ username: obj.username }).then((result) => {
    return cb(null, result);
  }).catch(cb);
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
// if user is authenticated in the session, carry on
  if (req.isAuthenticated()){
      res.locals.loggedIn = true;
      return next();
  }


  // if they aren't redirect them to the home page
  res.locals.loggedIn = false;
  res.json({error: 'Unauthorized'});
}

function ensureAdmin(req, res, next) {
  let username = req.session.passport.user.username;
  if (!_.isUndefined(req.session.passport.user.role) && req.session.passport.user.role === "admin"){
    next();
  }
  else{
    res.json({error: 'Unauthorized'});
  }

  // if they aren't redirect them to the home page
  // res.redirect('/');
}



function init(user){
  return new Promise(function(resolve, reject) {


    if (!initialized){


      var io = require('socket.io')(http);
      console.log('INITIALIZING');
      var SocketManager =  require('./utils/socket-manager');
      // console.log(global.rethinkdbConnection);

      io.on('connection', function(socket){
        global._socket = socket;
        var socketManager = new SocketManager(socket,io, user);
        console.log('CONNECTED', socket.id);
      });

      initialized = true;
    }

    resolve()
  });
}

setTimeout(()=>{
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.use(cookieParser());
  app.use(cookieSession({
    name: 'jarvis-session',
    keys: ['key-1'],
  }));


  // Initialize Passport and restore authentication state, if any, from the
  // session.
  app.use(passport.initialize());
  app.use(passport.session());


  app.get('/auth/github',
    passport.authenticate('github'));

  app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function(req, res) {
      req.session.user = req.user;
      // Successful authentication, redirect home.
      res.redirect(`http://localhost:3000`);
    });


  app.post('/api/user/userjson', isLoggedIn, function(req, res) {
    res.send(req.user);
  });


  app.use('/teams', proxy({ target: 'http://localhost:8888/teams', changeOrigin: true }));

  app.get('/user', function(req, res) {
    if (req.user === undefined) {
      res.json({});
    } else {

      res.json(req.user);
    }
  })


  app.get('/init', isLoggedIn, function(req, res){
    console.log('STARTING UP');
    sessionData = req.session;
    init(req.session.user).then(function(){
      res.send('done');
    })
  });



  app.get('/users', graphController.getUsers);

  app.post('/open', function(req, res){
    let address = req.body.address;
    let type = req.body.type;
    let cmd;
    switch(type){
      case 'url':
        cmd = 'open -a "Google Chrome" ' + address;
        break;
      case 'file':
        cmd = 'open -a "Atom" ' + projectsPath + address;
      break;
    }
    childProc.exec(cmd, function(){});


  });

  app.post('/health', function(req,res){
    res.json({'status' : 'healthy'});
  });

  app.post('/query', graphController.query);
  app.post('/blacklist', graphController.blacklistNode);

  app.get('/api/teams', function(req, res) {

    let userId = req.session.user.id;
    teamsController.getTeamsByUserId(userId).then(function(teams) {
      res.json(teams);
    });
  })

  app.post('/api/team/all',  [isLoggedIn, ensureAdmin], function(req,res){
    teamsController.getAllTeams().then(function(teams){
      res.json(teams)
    })
  });


  app.post('/api/user/teams', isLoggedIn, function(req, res){
    let teams;
    let userId = req.body.userId || req.session.passport.user.id;
    teamsController.getTeamsByUserId(userId).then(function(teams){
      res.json(teams)
    })
  });

  app.post('/api/user/accessibleTeams', isLoggedIn, function(req, res){
    let teams;
    let userId = req.body.userId || req.session.passport.user.id;
    let username = req.body.username || req.session.passport.user.username;

    userController.getAccessibleTeams(username).then(function(teams){
      res.json(teams)
    })
  });


  app.post('/api/user/teams/members', isLoggedIn, function(req,res){
    // let userId = req.body.userId;
    let userId = req.session.passport.user.id;
    teamsController.getTeamMembersByUserId(userId).then(function(teamMembers){
      res.json(teamMembers);
    });
  })

  app.post('/api/user/setAsAdmin', [isLoggedIn, ensureAdmin], function(req,res){
    let username = req.session.passport.user.username;
    usersController.setUserAsAdmin(username)
  });

  app.post('/api/user/all', ensureAdmin, function(req,res){
    // let username = req.session.passport.user.username;
    usersController.getAllUsers().then(function(users){
      res.json(users);
    })
  });

  app.post('/api/user/associate', ensureAdmin, function(req,res){
    let {username, teamname}= req.body;
    console.log('Invite', username, teamname);
    teamsController.inviteUserToTeam(username, teamname).then(function(relationship){
      res.json({relationship: relationship})
    })
  });

  app.post('/api/user/teams/invites', isLoggedIn, function(req, res){
    let {username} = req.body;
    userController.getTeamInvites(username).then(function(teams){
      res.json({teams: teams});
    })

  })

  app.post('/api/user/join', isLoggedIn, function(req,res){
    let {username, teamname}= req.body;

    //TODO - check user is pre associated with the team

    teamsController.relateUserToTeam(username, teamname).then(function(relationship){
      res.json({relationship: relationship})
    })
  });

  app.post('/api/user/setRootPath', isLoggedIn, function(req,res){
    let {username, rootPath}= req.body;
    userController.setRootPath(username, rootPath).then(function(relationship){
      res.json({relationship: relationship})
    })
  });

  app.post('/api/team/create', ensureAdmin, function(req,res){
    let {teamname} = req.body;
    teamsController.getSaveTeam(teamname).then(function(teamNode){
      res.json({teamNode: teamNode});
    });
  })

  app.post('/logout', function(req,res){
    req.session = null;
    console.log('LOGGING OUT');
    res.redirect('/');

  });


  if(isDev != 'false'){
    console.log('DEVELOPMENT MODE');
    app.use('/', proxy({ target: 'http://localhost:8888', changeOrigin: true }));
  }
  else{
    console.log('PRODUCTION MODE');
      app.use(express.static(path.join(__dirname,"../../client/build")));
  }
  let p = rethink.connect({host: rethinkConfig.host || "104.131.111.80", db: rethinkConfig.db});
  p.then(function(connection){
    // global.rethinkdbConnection = connection;
  });


  http.listen(3000, function(){
    console.log('CONFIG', dbConfig, userConfig, rethinkConfig);
    console.log('listening on *:3000');
  });
}, 1000);
