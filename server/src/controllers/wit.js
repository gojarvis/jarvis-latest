'use strict'
const rec       = require('node-record-lpcm16'),
      request   = require('request');

const witToken = 'GRATHGRK7U6MQA7I47YU5Z6VCLXSZFUJ'; // get one from wit.ai!
const wit = require('node-wit');
const shellConnector = require('./witShellConnector');

class WitController {
  constructor(socket){
    this.socket = socket;
    this.registerEvents()
  }
  registerEvents(){
    var self = this;

    self.socket.on('stop', function(){
      rec.stop();
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


        self.resultHandler(JSON.parse(body));
        self.actionHandler(JSON.parse(body));
        rec.stop();
      }));
    });

    self.socket.on('text', function(payload){
      let {text, topic} = payload;
      let options = {};
      if (topic){
          options = { 'context' : {state: topic} };
      }
      wit.captureTextIntent(witToken, text, options, function (err, result) {
          if (err) console.log("Error: ", err);
          // console.log(result);
          self.resultHandler(result);
          self.actionHandler(result);
      });
    });


  }
  actionHandler(result){
    let sc = new shellConnector(this.socket)
    sc.handleWitResult(result);
  }

  resultHandler(result){
    this.socket.emit('result', result);
  }

  createIntent(intent){

  }



  witRequest(text, options) {
    let access_token = witToken;

  // Set up the query
    query_params = _.extend({'q': text}, options);

  // Request options
    let request_options = {
        url: 'https://api.wit.ai/message',
        qs: query_params,
        json: true,
        headers: getHeaders(access_token)
    };

  // Make the request
      request(request_options, function (error, response, body) {
          if (response && response.statusCode != 200) {
              error = "Invalid response received from server: " + response.statusCode
          }
          callback(error, body);
      });
  }

}




module.exports = WitController
