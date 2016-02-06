import imm from 'immutable';
import {getEventsByTime, getRelatedKeywords, getFromUserIntent, getFromUser} from '../resolvers';
import EventEmitter from 'events';
import colors from 'colors';
import Goal from './goal'

let socket = GLOBAL._socket;

const objectives = [
 {
    name: 'startDate',
    humanName: 'Start Date',
    resolvers: [
      {
        name: 'getFromUserIntent',
        dependencies: [],
        params: {
          path: ['entities', 'datetime',  0, 'from', 'value']
        },
        target: 'startDate'
      }
    ],
  },
  {
    name: 'endDate',
    humanName: 'End Date',
    resolvers: [
      {
        name: 'getFromUserIntent',
        dependencies: [],
        params: {
          path: ['entities', 'datetime',  0, 'to', 'value']
        },
        target: 'endDate'
      }
    ]
  },
 {
    name: 'recentEvents',
    humanName: 'Recent Events',
    resolvers: [
      {
        name: 'getEventsByTime',
        params: {
          startDate: '$startDate',
          endDate: '$endDate'
        },
        dependencies: ['startDate', 'endDate'],
        target: 'recentItems'
      }
    ]
  }
];

const resolvers = {
  'getFromUser': getFromUser,
  'getFromUserIntent': getFromUserIntent,
  'getEventsByTime': getEventsByTime,
  'getRelatedKeywords': getRelatedKeywords
};

class HistoryGoal extends Goal {
  //This kicks off the goal (look at goal.js) internally. maybe it shouldn't
  constructor(parsedIntent) {
    // console.log('IN HISTORY GOAL'.rainbow, parsedIntent);
    super(objectives, parsedIntent);

    // this.master = super.master;
    this.master.on('allObjectivesResolved', this.objectiveResolved)
    console.log('ALL RESOLVED'.rainbow, this.resultPool);
    // this.resultPool = Map();

  }



  execute(){
    //Kicks off the goal
    this.master.emit('resolveObjectives');

    //Let's the executing party listen to events
    return this.master
  }

  objectivesResolved(){

    this.master.emit('goalResolved');
    // GLOBAL._socket.emit('speak', message);
  }

}

module.exports = HistoryGoal;
