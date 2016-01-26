import EventEmitter from 'events';
let socket = GLOBAL._socket;

class getFromUser {
  constructor(master) {
    console.log('RESOLVER GOT BUILT'.yellow);
    this.master = master;
    this.resolverName = 'getFromUser';

    this.master.on('getFromUser', this.get.bind(this));
    this.socket = GLOBAL._socket
    this.get = this.get.bind(this)
    this.objective = {};
    this.socket.on('answer_getFromUser', this.gotResponseFromUser.bind(this))
  }

  async get(objective) {
    console.log('hello master! i am here to server !'.blue, objective);
    console.log('emitting:', `objective${this.resolverName}Resolved`, this.master);
    this.objective = objective;
    ///MAGIC HERE

    let question = {
      text: "I need to know something...",
      target: 'answer_getFromUser'
    }
    this.socket.emit('questionFromJarvis', question)
    // this.socket.emit('speak', 'Um, sockets are here');

    // this.doAsync().then(function(){
    //
    // }.bind(this))
    // // when done

  }

  gotResponseFromUser(message){
    let {text} = message;
    let objective = this.objective;
    this.master.emit(`objectiveResolved`, { objective: objective, results: `I heard you said ${text}`});
  }

  doAsync(){
    return new Promise(function(resolve, reject) {
      setTimeout(function(){
        console.log('done async'.green);
        resolve();
      },3000)
    });
  }


}

module.exports = getFromUser;
