import imm from 'immutable';
import {getFromUser, getFromUserIntent} from '../resolvers';
import EventEmitter from 'events';
import colors from 'colors';
import Goal from './goal'

let socket = GLOBAL._socket;

const objectives = {
  userName: {
    name: 'userName',
    humanName: 'User Name',
    responseForm: ' your name is',
    resolvers: [
      {
        name: 'getFromUser',
        params: {},
        dependencies: [],
        target: 'userName'
      },
      {
        name: 'saveFact',
        params: {
          factType: 'user-fact',
          subject: 'userName',
          payload: '$userName', // marks the position of required in dependencies. Ask roie about this.
          source: 'user'
        },
        dependencies: ['userName'],
        target: 'fact'
      }
    ],
    question: {
      text: "What is your name?"
    },
    resolved: false
  }
};

const resolvers = {
  'getFromUser': getFromUser,
  'getFromUserIntent': getFromUserIntent
};

class GreetingGoal extends Goal {
  //This kicks off the goal (look at goal.js) internally. maybe it shouldn't
  constructor() {
    super(objectives, parsedIntent);
    // this.master = super.master;
    this.master.on('allObjectivesResolved', this.objectiveResolved)

    // this.resultPool = Map();

  }

  execute(){
    //Kicks off the goal
    this.master.emit('resolveObjectives');

    //Let's the executing party listen to events
    return this.master
  }

  objectivesResolved(){
    // console.log(this.results);
    let message = 'Great. I learned ' + this.results.count() + ' facts about you. ';
    let parts = this.results.map(item => {
      return item.get('responseForm') + ' ' + item.get('results')
    });

    message += parts.join(' and ');
    message += ' . That is good to know!';

    this.master.emit('goalResolved');
    // GLOBAL._socket.emit('speak', message);
  }

}

module.exports = GreetingGoal;
