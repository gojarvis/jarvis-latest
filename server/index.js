var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var imm = require('immutable');

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

// usernames which are currently connected to the chat
var numUsers = 0;
var files = imm.Set();

io.on('connection', function (socket) {
  console.log('got connection:', socket.id);
  numUsers++;
  socket.emit('login', {
    test: 'yay!'
  });
  socket.emit('files', files)

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

  socket.on('disconnect', function() {
    console.log('disconnected')
    numUsers--;
  })
})
