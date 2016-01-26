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
    resolved: false,
    results: {}
  }
};

const resolvers = {
  'getFromUser': getFromUser,
  'getFromUserIntent': getFromUserIntent
};

class GreetingGoal extends Goal {
  constructor() {
    super(objectives, resolvers);
    this.master = super.master;
    console.log('MASTER',this.master);
  }

  onObjectivesDone(){
    console.log('objectives done');
  }

}

module.exports = GreetingGoal;
