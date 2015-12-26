const WitController = require('../controllers/wit');
const FileSystemController = require('../controllers/filesystem');
const TeachController = require('../controllers/teach');
const ChromeController = require('../controllers/chrome');
const AtomController = require('../controllers/atom');

const Context = require('../controllers/contextManager');

const Proactive = require('../controllers/proactive')

//The context contains all the urls and files open right now
//Access to the knowledge graph is gained via the context
const context = new Context();

class SocketManager {
  constructor(socket,io){
    let sid = 'GKvm4Sdf';

    //basic speech in/out
    this.wit = new WitController(socket, sid, context)

    //Basic conversation
    this.teach = new TeachController(socket, sid, context)

    //Sensors (plugins)
    this.chrome = new ChromeController(socket, sid, io, context)
    this.atom = new AtomController(socket, sid, io, context)


    this.proactive = new Proactive(socket, sid, io, context);
  }
}
module.exports = SocketManager;
