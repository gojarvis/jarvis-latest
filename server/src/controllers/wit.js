const rec       = require('node-record-lpcm16'),
      request   = require('request');

const witToken = 'VS4GQRJAHZHC2WIYMERJKGO2ONZ6VL2R'; // get one from wit.ai!
const wit = require('node-wit');

class WitController {
  constructor(socket){
    this.socket = socket;
    this.registerEvents()
  }
  registerEvents(){
    var self = this;

    self.socket.on('stop', function(){
      rec.stop();
      console.log('stopped');
      self.socket.emit('stopped');
    });


    self.socket.on('record', function(){
      self.socket.emit('recording');

      rec.start().pipe(request.post({
        'url'     : 'https://api.wit.ai/speech?client=chromium&lang=en-us&output=json',
        'headers' : {
          'Accept'        : 'application/vnd.wit.20160202+json',
          'Authorization' : 'Bearer ' + witToken,
          'Content-Type'  : 'audio/wav'
        },
      }, function(err,resp,body){
        self.socket.emit('stop');
        self.resultHandler(body)
      }));
    });

    self.socket.on('text', function(text){
      console.log('recieved command: ', text);
      wit.captureTextIntent(witToken, text, function (err, result) {
          if (err) console.log("Error: ", err);
          console.log(result);          
          self.resultHandler(result);
      });
    });
  }
  resultHandler(result){
    this.socket.emit('result', result);
  }

}




module.exports = WitController
