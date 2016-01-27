import EventEmitter from 'events';
let socket = GLOBAL._socket;

class getFromUser {
  constructor(master) {
    this.master = master;
    this.resolverName = 'getFromUser';
    this.objective = {};

    this.master.on('getFromUser', this.get.bind(this));
    this.socket = GLOBAL._socket

    this.socket.on('answer_getFromUser', this.gotResponseFromUser.bind(this))

    this.get = this.get.bind(this)

    this.gotResponseFromUser = this.gotResponseFromUser.bind(this);

  }

  async get(objective) {
    this.objective = objective;
    let text = objective.get('question').get('text');
    // console.log('QUESTION', text);
    let question = {
      text: text,
      target: 'answer_getFromUser'
    }

    this.socket.emit('questionFromJarvis', question)

  }

  gotResponseFromUser(message){
    let {text} = message;
    let objective = this.objective;
    this.master.emit('objectiveResolved', { objective: objective, results: text});
  }




}

module.exports = getFromUser;
