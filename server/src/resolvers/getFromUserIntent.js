import EventEmitter from 'events';
import colors from 'colors';
let socket = GLOBAL._socket;

// try to get from user intent
// if this is not possible, ask the user for clarification
class getFromUserIntent {
  constructor(master) {
    this.master = master;
    this.resolverName = 'getFromUserIntent';
    this.objective = {};

    this.master.on('getFromUserIntent', this.get.bind(this));
    this.socket = GLOBAL._socket;

    this.socket.on('answer_getFromUserIntent_userResponse', this.gotResponseFromUser.bind(this));
  }

  async get(objective, userIntent) {
    console.info('getFromUserIntent::get:'.cyan, objective, userIntent);
    let text = objective.get('question').get('text');
    console.info('QUESTION', text);
    let question = {
      text,
      target: 'answer_getFromUserIntent_userResponse'
    }

    this.socket.emit('questionFromJarvis', question)

    // when done
    // this.master.emit(`objective${paramaterName}Resolved`);
  }

  gotResponseFromUser(message) {
    let {text} = message;
    let objective = this.objective;
    this.master.emit(`objectiveResolved`, {
      objective: objective,
      results: `I heard you say ${text}`,
      raw: message
    });
  }
}

module.exports = getFromUserIntent;
