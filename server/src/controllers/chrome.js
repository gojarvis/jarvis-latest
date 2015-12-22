
class ChromeController {
  constructor(socket){
    this.socket = socket;
    this.registerEvents()
  }
  registerEvents(){
    var self = this;

    self.socket.on('chrome-init', function(tabs){

    });

    self.socket.on('chrome-created', function(active){
      console.log('chrome-created');
      console.log(active);
    });

    self.socket.on('chrome-highlighted', function(active){
      console.log('chrome-highlighted');
      console.log(active);
    });

  }

}




module.exports = ChromeController
