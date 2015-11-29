'use strict';

var rec = require('node-record-lpcm16'),
    request = require('request');

var witToken = 'VS4GQRJAHZHC2WIYMERJKGO2ONZ6VL2R'; // get one from wit.ai!

exports.parseResult = function (err, resp, body) {
  console.log(body);
};

rec.start().pipe(request.post({
  'url': 'https://api.wit.ai/speech?client=chromium&lang=en-us&output=json',
  'headers': {
    'Accept': 'application/vnd.wit.20160202+json',
    'Authorization': 'Bearer ' + witToken,
    'Content-Type': 'audio/wav'
  }
}, exports.parseResult));
'use strict';

var _socketManager = require('utils/socket-manager');

var _socketManager2 = _interopRequireDefault(_socketManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
  res.sendfile('client/src/www/index.html');
});

io.on('connection', function (socket) {
  var socketManager = new _socketManager2.default(socket);
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
"use strict";
"use strict";
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var rec = require('node-record-lpcm16'),
    request = require('request');

var witToken = 'VS4GQRJAHZHC2WIYMERJKGO2ONZ6VL2R'; // get one from wit.ai!
var wit = require('node-wit');

var WitController = (function () {
  function WitController(socket) {
    _classCallCheck(this, WitController);

    this.socket = socket;
  }

  _createClass(WitController, [{
    key: 'initializeSocket',
    value: function initializeSocket(socket) {
      var self = this;

      self.socket.on('stop', function () {
        rec.stop();
        console.log('stopped');
        self.socket.emit('stopped');
      });

      self.socket.on('record', function () {
        self.socket.emit('recording');

        rec.start().pipe(request.post({
          'url': 'https://api.wit.ai/speech?client=chromium&lang=en-us&output=json',
          'headers': {
            'Accept': 'application/vnd.wit.20160202+json',
            'Authorization': 'Bearer ' + witToken,
            'Content-Type': 'audio/wav'
          }
        }, function (err, resp, body) {
          self.socket.emit('stop');
          self.resultHandler(err, resp, body);
        }));
      });

      self.socket.on('text', function (text) {
        console.log('recieved command: ', text);
        wit.captureTextIntent(witToken, text, function (err, result) {
          if (err) console.log("Error: ", err);
          self.resultHandler(result);
        });
      });
    }
  }, {
    key: 'resultHandler',
    value: function resultHandler(result) {}
  }]);

  return WitController;
})();

module.exports = WitController;
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var wit = require('../controllers/wit');

var SocketManager = function SocketManager(socket) {
  _classCallCheck(this, SocketManager);

  wit.initializeSocket(socket);
};

module.exports = SocketManager;
//# sourceMappingURL=all.js.map
