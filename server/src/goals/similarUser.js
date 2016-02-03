import imm from 'immutable';
import {getEventsByTime, getRelatedKeywords, getFromUserIntent, getFromUser} from '../resolvers';
import EventEmitter from 'events';
import colors from 'colors';
import Goal from './goal'

let socket = GLOBAL._socket;

const objectives = {

  resolveContext: {
    name: 'userContext',
    humanName: 'User Context',
    resolvers: [
      {
        name: 'getUserContext',
        dependencies: [],
        params: {},
        target: 'userContext'
      }
    ],
  },

  relatedUrls: {
    name: 'relatedUrls',
    resolvers: [
      {
        name: 'relatedItems',
        params: {
          source: '$recentItems',
          relationship: 'related',
          threshold: 10
        }
      }
    ],
    dependencies: ['recentItems'],
    target: 'relatedKeywords'
  }


};

const resolvers = {
  'getFromUser': getFromUser,
  'getFromUserIntent': getFromUserIntent,
  'getEventsByTime': getEventsByTime,
  'getRelatedKeywords': getRelatedKeywords
};

class HistoryGoal extends Goal {
  //This kicks off the goal (look at goal.js) internally. maybe it shouldn't
  constructor() {
    super(objectives);
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

    this.master.emit('goalResolved');
    // GLOBAL._socket.emit('speak', message);
  }

}

module.exports = HistoryGoal;
