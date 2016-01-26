import imm from 'immutable';
import {getFromUser, getFromUserIntent} from '../resolvers';
import EventEmitter from 'events';
import colors from 'colors';
import Goal from './goal'

const objectives = {
  dateWindow: {
    name: 'dateWindow',
    humanName: 'Date Window',
    resolvers: [
      'getFromUserIntent', 'getFromUser'
    ],
    question: {
      text: 'I don\'t know what to say'
    },
    test: (result) => {},
    resolved: false,
    results: {}
  }
}

const resolvers = {
  'getFromUserIntent': getFromUserIntent,
  'getFromUser': getFromUser,
}

class HistoryGoal extends Goal {
  constructor(userIntent) {
    console.log('???'.cyan, userIntent)
    super(objectives, {
      'getFromUserIntent': getFromUserIntent.bind({userIntent: userIntent}),
      'getFromUser': getFromUser,
    }, userIntent);
    this.master = super.master;
  }

  onObjectivesDone(data) {
    console.log('objectives done:', data);
  }
}

module.exports = HistoryGoal;
