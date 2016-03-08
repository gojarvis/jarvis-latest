'use strict'
import shExec from './shExec'

class FileSystemController {
  constructor(socket){
    this.socket = socket;
    this.registerEvents()
  }

  registerEvents(){
    let self = this;

    self.socket.on('exec', function(scriptName){
        shExec(scriptName).then(function(res){
          console.log('exec-res',res)
          self.socket.emit('exec-done', res);
        })
    });
  }
}

module.exports = FileSystemController
