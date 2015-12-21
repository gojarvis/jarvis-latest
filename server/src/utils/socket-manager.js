const WitController = require('../controllers/wit');
const FileSystemController = require('../controllers/filesystem');
const TeachController = require('../controllers/teach');

class SocketManager {
  constructor(socket){
    this.teach = new TeachController(socket)
    this.wit = new WitController(socket)


  }
}
module.exports = SocketManager;
