const WitController = require('../controllers/wit');
const FileSystemController = require('../controllers/filesystem');
const TeachController = require('../controllers/teach');
const ChromeController = require('../controllers/chrome');
const AtomController = require('../controllers/atom');

const Context = require('../controllers/contextManager');



class SocketManager {
  constructor(socket,io){
    let sid = 'GKvm4Sdf';
    let context = new Context();

    this.teach = new TeachController(socket, sid, context)
    this.wit = new WitController(socket, sid, context)
    this.chrome = new ChromeController(socket, sid, io, context)
    this.atom = new AtomController(socket, sid, io, context)
  }
}
module.exports = SocketManager;
