import EventEmitter from 'events';
let socket = GLOBAL._socket;

class getFromUser {
  constructor(master) {
    this.master = master;
    this.resolverName = 'getFromUser';
    this.objective = {};
    console.log('MASTER'.red);
    this.master.on('getFromUser', this.get.bind(this));
    this.socket = GLOBAL._socket

    this.socket.on('answer_getFromUser', this.gotResponseFromUser.bind(this))

    this.get = this.get.bind(this)

    this.gotResponseFromUser = this.gotResponseFromUser.bind(this);

  }

  async get(message) {

    let {objective, target} = message;
    console.log('GOT objective', objective);

    this.objective = objective;
    this.target = target;
    let text = objective.get('question').get('text');
    // console.log('QUESTION', text);
    let question = {
      text: text,
      target: 'answer_getFromUser'
    }
    console.log('GETTING', question);
    this.socket.emit('questionFromJarvis', question)

  }

  gotResponseFromUser(message){
    let {text} = message;
    let objective = this.objective;
    let target = this.target
    this.master.emit('resolverDone', { objective: objective, results: text, resolverName: 'getFromUser', target: target});
  }




}

module.exports = getFromUser;
