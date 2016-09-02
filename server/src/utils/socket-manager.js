const ChromeController = require('../controllers/chrome');
const AtomController = require('../controllers/atom');
const TerminalController = require('../controllers/terminal');
const Context = require('../controllers/contextManager');
const History = require('../controllers/historyManager');
// console.log('AAA', TerminalController);
let _ = require('lodash');


let context = {};

class SocketManager {
  constructor(socket, io, user) {

    let history = new History(socket,io, user.username);

    if (_.isUndefined(context.user)){
        context = new Context(history, { username: user.username});
    }


    //Plugins
    try{
      this.chrome = new ChromeController(socket, io, context, history)
      this.atom = new AtomController(socket, io, context, history)
      this.terminal = new TerminalController(socket, io, context, history)
      console.log('All controller instantiated');
    }
    catch(e){
      console.log('Cant instantiate controllers', e);
    }


  }
}
module.exports = SocketManager;
