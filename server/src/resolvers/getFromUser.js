import EventEmitter from 'events';
import eventToPromise from 'event-to-promise'
import colors from 'colors';


class getFromUser {
  constructor(master) {
    this.resolverName = 'getFromUser';
    this.socket = global._socket

    this.get = this.get.bind(this)
    this.gotResponseFromUser = this.gotResponseFromUser.bind(this);

  }

  async execute(message){
    let result = await this.get(message)
    return result
  }

  async get(message) {

    let {objective, target, params} = message;
    this.objective = objective;
    this.target = target;

    let text = params.get('question')
    let question = {
      text: text,
      target: 'answer_getFromUser'
    }

    this.socket.emit('questionFromJarvis', question)

    let response = await eventToPromise(this.socket, 'answer_getFromUser')
    let result = this.gotResponseFromUser(response);
    return result;

  }

  gotResponseFromUser(response){
    let {text} = response;
    let objective = this.objective;
    let target = this.target
    return { objective: objective, results: text, resolverName: 'getFromUser', target: target};
  }




}

module.exports = getFromUser;
