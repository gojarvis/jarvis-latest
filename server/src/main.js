let express = require('express');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let cookieSession = require('cookie-session');
let proxy = require('http-proxy-middleware');
let app = express();
let http = require('http').Server(app);
let bodyParser = require('body-parser');

let rethink = require('rethinkdb');

let graphController = require('./controllers/graph')
let childProc = require('child_process');
let config = require('config');
let passport = require('passport');
let _ = require('lodash');

let path = require("path");

let ProjectSettingsManager = require('./utils/project-settings-manager');
let projectSettingsManager = new ProjectSettingsManager();
let rethinkConfig = config.get('rethink');
let GraphUtil = require('./utils/graph');
let graphUtil = new GraphUtil();
let staticClientPath = path.join(__dirname, '../../client/build/');
let usersController = require('./controllers/users');
let teamsController = require('./controllers/teams');
let settingsController = require('./controllers/settings');
let sessionData = {};

let isDev = !_.isUndefined(process.env.JARVIS_DEV);

let initialized = false;

/** Passport **/
let gitHubStrategy = require('./strategies/github')
passport.use(gitHubStrategy);

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    graphUtil.getSaveUserInGraph({
        username: obj.username
    }).then((result) => {
        return cb(null, result);
    }).catch(cb);
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        res.locals.loggedIn = true;
        return next();
    }


    // if they aren't redirect them to the home page
    res.locals.loggedIn = false;
    res.json({
        error: 'Unauthorized'
    });
}

function ensureAdmin(req, res, next) {
    let username = req.session.passport.user.username;
    if (!_.isUndefined(req.session.passport.user.role) && req.session.passport.user.role === "admin") {
        next();
    } else {
        res.json({
            error: 'Unauthorized'
        });
    }

    // if they aren't redirect them to the home page
    // res.redirect('/');
}



function init(user) {
    return new Promise(function(resolve, reject) {
        if (!initialized) {
            var io = require('socket.io')(http);
            console.log('INITIALIZING');
            var SocketManager = require('./utils/socket-manager');
            // console.log(global.rethinkdbConnection);

            io.on('connection', function(socket) {
                global._socket = socket;
                var socketManager = new SocketManager(socket, io, user);
                console.log('CONNECTED', socket.id);
            });

            initialized = true;
        }

        resolve()
    });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

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
    passport.authenticate('github', {
        failureRedirect: '/login'
    }),
    function(req, res) {
        req.session.user = req.user;
        // Successful authentication, redirect home.
        res.redirect(`http://localhost:3000`);
    });

app.post('/api/user/userjson', isLoggedIn, function(req, res) {
    res.send(req.user);
});

app.use('/teams', proxy({
    target: 'http://localhost:8888/teams',
    changeOrigin: true
}));

app.get('/user', function(req, res) {
    if (req.user === undefined) {
        res.json({});
    } else {

        res.json(req.user);
    }
})

app.get('/init', isLoggedIn, function(req, res) {
    sessionData = req.session;
    init(req.session.user).then(function() {
        res.send('done');
    })
});

app.get('/users', graphController.getUsers);

app.post('/open', function(req, res) {
    let rootPath = projectSettingsManager.getRootPath();
    let address = req.body.address;
    let type = req.body.type;
    let cmd;
    switch (type) {
        case 'url':
            cmd = 'open -a "Google Chrome" ' + address;
            break;
        case 'file':
            cmd = 'open -a "Atom" ' + rootPath + address;
            break;
    }
    childProc.exec(cmd, function() {});


});

app.post('/health', function(req, res) {
    res.json({
        'status': 'healthy'
    });
});

app.post('/query', graphController.query);

app.post('/blacklist', graphController.blacklistNode);

app.get('/api/teams', function(req, res) {

    let userId = req.session.user.id;
    teamsController.getTeamsByUserId(userId).then(function(teams) {
        res.json(teams);
    });
})

app.post('/api/team/all', [isLoggedIn, ensureAdmin], function(req, res) {
    teamsController.getAllTeams().then(function(teams) {
        res.json(teams)
    })
});

app.post('/api/user/teams', isLoggedIn, function(req, res) {
    let teams;
    let userId = req.body.userId || req.session.passport.user.id;
    teamsController.getTeamsByUserId(userId).then(function(teams) {
        res.json(teams)
    })
});

app.post('/api/user/accessibleTeams', isLoggedIn, function(req, res) {
    let teams;
    let userId = req.body.userId || req.session.passport.user.id;
    let username = req.body.username || req.session.passport.user.username;

    usersController.getAccessibleTeams(username).then(function(teams) {
        res.json(teams)
    })
});

app.post('/api/user/teams/members', isLoggedIn, function(req, res) {
    // let userId = req.body.userId;
    let userId = req.session.passport.user.id;
    teamsController.getTeamMembersByUserId(userId).then(function(teamMembers) {
        res.json(teamMembers);
    });
})

app.post('/api/user/setAsAdmin', [isLoggedIn, ensureAdmin], function(req, res) {
    let username = req.session.passport.user.username;
    usersController.setUserAsAdmin(username).then(function(userNode) {

    })
});

app.post('/api/user/create', [isLoggedIn, ensureAdmin], function(req, res) {
    let {
        username,
        role
    } = req.body;
    usersController.createUser(username, role).then(function(userNode) {
        res.json(userNode);
    })


});

app.post('/api/user/all', ensureAdmin, function(req, res) {
    // let username = req.session.passport.user.username;
    usersController.getAllUsers().then(function(users) {
        res.json(users);
    })
});

app.post('/api/user/associate', ensureAdmin, function(req, res) {
    let {
        username,
        teamname
    } = req.body;
    teamsController.inviteUserToTeam(username, teamname).then(function(relationship) {
        res.json({
            relationship: relationship
        })
    })
});

app.post('/api/user/teams/invites', isLoggedIn, function(req, res) {
    let {
        username
    } = req.body;
    console.log('Getting invites for', username);

    usersController.getTeamInvites(username).then(function(teams) {
        console.log('invites for ', username, teams);
        res.json(teams);
    })

})

app.post('/api/user/join', isLoggedIn, function(req, res) {
    let username = req.session.passport.user.username;
    let {
        teamname
    } = req.body;

    //TODO - check user is pre associated with the team

    teamsController.relateUserToTeam(username, teamname).then(function(relationship) {
        res.json({
            relationship: relationship
        })
    })
});

app.post('/api/user/setRootPath', isLoggedIn, function(req, res) {
    let {
        username,
        rootPath
    } = req.body;
    settingsController.setRootPath(rootPath).then(function(path) {
        res.json({
            rootPath: path
        })
    })
});

app.post('/api/user/setRepoCredentials', isLoggedIn, function(req, res) {
    let {
        username,
        password,
        address
    } = req.body;
    settingsController.setRepoCredentials({
        username,
        password,
        address
    }).then(function(credentials) {
        res.json({
            credentials
        })
    })
});

app.post('/api/user/getRootPath', isLoggedIn, function(req, res) {
    settingsController.getRootPath().then(function(path) {
        res.json(path)
    })
});

app.post('/api/user/getFilterStatus', isLoggedIn, function(req,res){

  let {filterType} = req.body
  settingsController.getFilterStatus(filterType).then(function(filterStatus){
    res.json({
      filterStatus
    })
  })
})

app.post('/api/user/setFilterStatus', isLoggedIn, function(req,res){
  let {filterType, filterStatus} = req.body;

  settingsController.setFilterStatus(filterType, filterStatus).then(function(newFilterStatus){
    res.json({
      newFilterStatus
    })
  })
})

app.post('/api/user/setActivityManagerAddress', isLoggedIn, function(req, res) {
    let {
        address
    } = req.body;
    settingsController.setActivityManagerAddress({
        address
    }).then(function(address) {
        res.json({
            address
        })
    })
});

app.post('/api/user/getActivityManagerAddress', isLoggedIn, function(req, res) {
    settingsController.getActivityManagerAddress().then(function(path) {
        res.json(path)
    })
});

app.post('/api/team/create', ensureAdmin, function(req, res) {
    let {
        teamname
    } = req.body;
    teamsController.getSaveTeam(teamname).then(function(teamNode) {
        res.json({
            teamNode: teamNode
        });
    });
})


app.post('/api/user/saveFilterExpression', isLoggedIn, function(req, res) {
    let expression = req.body.expression;
    let type = req.body.expressionType;
    let user = req.session.passport.user;

    settingsController.addExpression(expression, type, user).then(relationship => {
        console.log('done adding expression in main.js', relationship);
        res.json({relationship});
    })
})

app.post('/api/user/listFilterExpressions', isLoggedIn, function(req, res) {
    let type = req.body.expressionType;
    let user = req.session.passport.user;


    settingsController.listFilterExpression(type, user).then(expressions => {
        res.json(expressions);
    })

});




app.post('/logout', function(req, res) {
    req.session = null;
    console.log('LOGGING OUT');
    res.redirect('/');

});

if (isDev) {
    console.log('DEVELOPMENT MODE', !_.isUndefined(process.env.JARVIS_DEV));
    app.use('/', proxy({
        target: 'http://localhost:8888',
        changeOrigin: true
    }));
} else {
    console.log('PRODUCTION MODE');
    console.log('staticClientPath', staticClientPath);
    app.use(express.static(staticClientPath));
}

http.listen(3000, function() {
    console.log('listening on *:3000');
});
