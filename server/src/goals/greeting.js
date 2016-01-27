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
      'getFromUser'
    ],
    question: {
      text: "What is your name?"
    },
    resolved: false,
    results: {}
  },
  userHobby: {
    name: 'userHobby',
    humanName: 'User Hobby',
    responseForm: ' your hobby is',
    resolvers: [
      'getFromUser'
    ],
    question: {
      text: "What is your hobby?"
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
  //This kicks off the goal (look at goal.js) internally. maybe it shouldn't
  constructor() {
    super(objectives, resolvers);
    // this.master = super.master;
    this.master.on('allObjectivesResolved', this.objectiveResolved)
  }

  objectivesResolved(){
    console.log('WHOOOHOHOHOHHO');
    // console.log(this.results);
    let message = 'Great. I learned ' + this.results.count() + ' facts about you. ';
    let parts = this.results.map(item => {
      return item.get('responseForm') + ' ' + item.get('results')
    });

    message += parts.join(' and ');
    message += ' . That is good to know!';


    GLOBAL._socket.emit('speak', message);
  }

}

module.exports = GreetingGoal;
