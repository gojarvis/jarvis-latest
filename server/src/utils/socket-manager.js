const ChromeController = require('../controllers/chrome');
const AtomController = require('../controllers/atom');
const Context = require('../controllers/contextManager');
const History = require('../controllers/historyManager');

let _ = require('lodash');


let context = {};

class SocketManager {
  constructor(socket, io, user) {
    let sid = 'GKvm4Sdf';
    var history = new History(socket,io, user.username);
    if (_.isUndefined(context.user)){
        context = new Context(history, { username: user.username});
    }
    console.log(context.addFileNode);
    //Plugins
    this.chrome = new ChromeController(socket, io, context, history)
    this.atom = new AtomController(socket, io, context, history)

  }
}
module.exports = SocketManager;
