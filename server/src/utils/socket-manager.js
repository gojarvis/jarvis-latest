const WitController = require('../controllers/wit');
const FileSystemController = require('../controllers/filesystem');
const TeachController = require('../controllers/teach');
const ChromeController = require('../controllers/chrome');
const AtomController = require('../controllers/atom');

const Context = require('../controllers/contextManager');
const History = require('../controllers/historyManager');

const Proactive = require('../controllers/proactive')

//The context contains all the urls and files open right now
//Access to the knowledge graph is gained via the context

const history = new History();

const context = new Context(history);

class SocketManager {
  constructor(socket,io){
    let sid = 'GKvm4Sdf';

    //basic speech in/out
    this.wit = new WitController(socket, sid, context, history)

    //Basic conversation
    this.teach = new TeachController(socket, sid, context, history)

    //Sensors (plugins)
    this.chrome = new ChromeController(socket, sid, io, context, history)
    this.atom = new AtomController(socket, sid, io, context, history)

    this.proactive = new Proactive(socket, sid, io, context, history);
  }
}
module.exports = SocketManager;
