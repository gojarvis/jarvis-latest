var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var rec       = require('node-record-lpcm16'),
    request   = require('request');



var witToken = 'VS4GQRJAHZHC2WIYMERJKGO2ONZ6VL2R'; // get one from wit.ai!

exports.parseResult = function (err, resp, body) {
  console.log(body);
};

var witQuery = function(socket){

}

var emitResult = function(err,resp,body){
  console.log(body);

}


app.get('/', function(req, res){
  res.sendfile('client/src/www/index.html');
});

io.on('connection', function(socket){
  socket.on('stop', function(){
    rec.stop();
    console.log('stopped');
    socket.emit('stopped');

  });


  socket.on('record', function(){
    socket.emit('recording');

    rec.start().pipe(request.post({
      'url'     : 'https://api.wit.ai/speech?client=chromium&lang=en-us&output=json',
      'headers' : {
        'Accept'        : 'application/vnd.wit.20160202+json',
        'Authorization' : 'Bearer ' + witToken,
        'Content-Type'  : 'audio/wav'
      },
    }, function(err,resp,body){
      socket.emit('stop');
      socket.emit('result', body);
    }));
  });


});



http.listen(3000, function(){
  console.log('listening on *:3000');
});
