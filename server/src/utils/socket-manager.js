const WitController = require('../controllers/wit');
const FileSystemController = require('../controllers/filesystem');
const TeachController = require('../controllers/teach');
const ChromeController = require('../controllers/chrome');

class SocketManager {
  constructor(socket){
    this.teach = new TeachController(socket)
    this.wit = new WitController(socket)
    this.chrome = new ChromeController(socket)


  }
}
module.exports = SocketManager;
