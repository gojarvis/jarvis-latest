import imm from 'immutable';
import {getFromUser, getFromUserIntent} from '../resolvers';
import EventEmitter from 'events';
import colors from 'colors';
import Goal from './goal'

const objectives = {
  userName: {
    name: 'userName',
    humanName: 'User Name',
    resolvers: [
      'getFromUser'
    ],
    question: {
      text: "What is your name?"
    },
    resolved: false,
    results: {}
  }
};

const resolvers = {
  'getFromUser': getFromUser,
  'getFromUserIntent': getFromUserIntent
};

class GreetingGoal extends Goal {
  constructor(userIntent) {
    super(objectives, resolvers, userIntent);
    this.master = super.master;
  }

  onObjectivesDone(data) {
    console.log('objectives done:', data);
  }

}

module.exports = GreetingGoal;
