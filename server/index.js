var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var imm = require('immutable');
var moniker = require('moniker');
var names = moniker.generator([moniker.adjective, moniker.noun]);

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

// usernames which are currently connected to the chat
var numUsers = 0;
var connections = imm.Set();
var files = imm.Set();
var fileToOpen = 'server/package.json';

var cwd = '';

io.on('connection', function (socket) {
  var newConn = {
    id: socket.id,
    name: names.choose()
  };
  connections = connections.add(newConn);
  socket.emit('name', newConn);
  console.log('connections: ', connections.toJS());

  socket.emit('files', files)

  socket.on('files', function(files) {
    console.log('files:', files);
  });

  socket.on('set cwd', function(cwd) {
    console.log('new cwd:', cwd);
    cwd = cwd;
  });

  socket.on('give context', function() {
    socket.emit('context', {
      files: [cwd + fileToOpen]
    });
  });

  socket.on('file opened', function(file) {
    console.log('file opened:', file)
    files = files.add(file.uri);
    socket.emit('files', files)
  })

  socket.on('file closed', function(file) {
    console.log('file closed:', file)
    files = files.delete(file.uri);
    socket.emit('files', files)
  })

  socket.on('file saved', function(file) {
    console.log('file saved:', file)
  });

  socket.on('cmd', function(cmd) {
    console.log('cmd:', cmd);
  });

  socket.on('disconnect', function() {
    connections = connections.filter(function(item) {
      if(item.id !== socket.id) {
        return true;
      }
    });

    console.log('disconnected')
    numUsers--;
  });
})
