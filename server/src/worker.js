'use strict'

var fs = require('fs');
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');
var proxy = require('express-http-proxy');
var SocketManager = require('./utils/socket-manager');

module.exports.run = function (worker) {
  require("babel-register");

  console.log('   >> Worker PID:', process.pid);

  var app = require('express')();

  var httpServer = worker.httpServer;
  var scServer = worker.scServer;

  // app.use(serveStatic(path.resolve(__dirname, 'public')));
  // app.get('/', function(req, res){
  //
  // });

  app.use('/', proxy('localhost:8888', {
    forwardPath: function(req, res) {
       return require('url').parse(req.url).path;
     }
  }))

  httpServer.on('request', app);

  var count = 0;

  /*
    In here we handle our incoming realtime connections and listen for events.
  */
  scServer.on('connection', function (socket) {

    // Some sample logic to show how to handle client events,
    // replace this with your own logic

    var socketManager = new SocketManager(socket);

    socket.on('sampleClientEvent', function (data) {
      count++;
      console.log('Handled sampleClientEvent', data);
      scServer.exchange.publish('sample', count);
    });

    var interval = setInterval(function () {
      socket.emit('rand', {
        rand: Math.floor(Math.random() * 5)
      });
    }, 1000);

    socket.on('disconnect', function () {
      clearInterval(interval);
    });
  });
};
