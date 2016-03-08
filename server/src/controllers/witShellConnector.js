'use strict'
import exec from './nodeExec'

class witShellConnector {
  constructor(socket){
    this.socket = socket;
  }



  handleWitResult(incoming){
    let self = this;
    if (incoming && incoming.outcomes && incoming.outcomes.length > 0){
      let bestInputGuess = incoming.outcomes[0];

      switch(bestInputGuess.intent){
        case 'run_script':
            if (bestInputGuess.entities && bestInputGuess.entities.script.length > 0){
              let script = bestInputGuess.entities.script[0].value;
              switch(script){
                  case 'show file system':
                    exec('list-files.sh', '../../').then(function(result){
                      this.socket.emit('action-result', result);
                    }.bind(this));
                  break;
              }
            }

        break;
      }
    }
  }
}

module.exports = witShellConnector
