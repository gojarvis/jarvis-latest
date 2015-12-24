const WitController = require('../controllers/wit');
const FileSystemController = require('../controllers/filesystem');
const TeachController = require('../controllers/teach');
const ChromeController = require('../controllers/chrome');

class SocketManager {
  constructor(socket,io){
    let sid = 'GKvm4Sdf';
    this.teach = new TeachController(socket, sid)
    this.wit = new WitController(socket, sid)
    this.chrome = new ChromeController(socket, sid, io)
  }
}
module.exports = SocketManager;
