let imm = require('immutable');
let {getFromUser, getFromUserIntent} = require('../resolvers');
let EventEmitter = require('events');
let colors = require('colors');
let Goal = require('./goal');

let socket = global._socket;

const objectives = {
  goalName: {
    name: 'goalName',
    humanName: 'Goal name',
    responseForm: ' the goal name is',
    resolvers: [
      'getFromUser'
    ],
    question: {
      text: "What would you like to call the goal?"
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

class MetaGoal extends Goal {
  //This kicks off the goal (look at goal.js) internally. maybe it shouldn't
  constructor() {
    super(objectives, resolvers);
    // this.master = super.master;
    this.master.on('allObjectivesResolved', this.objectiveResolved)
  }

  objectivesResolved(){
    let message = 'Great. I learned ' + this.results.count() + ' facts about you. ';
    let parts = this.results.map(item => {
      return item.get('responseForm') + ' ' + item.get('results')
    });

    message += parts.join(' and ');
    message += ' . That is good to know!';


    global._socket.emit('speak', message);
  }

}

module.exports = MetaGoal;
