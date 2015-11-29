const WitController = require('../controllers/wit');

class SocketManager {
  constructor(socket){
    this.wit = new WitController(socket)    
  }
}
module.exports = SocketManager;
