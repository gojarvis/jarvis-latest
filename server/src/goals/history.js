import imm from 'immutable';
import {getFromUser, getFromUserIntent} from '../resolvers';
import EventEmitter from 'events';
import colors from 'colors';

class HistoryGoal {
  constructor() {
    this.objectives = imm.fromJS({
      startDate: {
        name: 'startDate',
        humanName: 'Start Date',
        resolvers: [
          'getFromUserIntent', 'getFromUser'
        ],
        resolved: false,
        results: {}
      },
      endDate: {
        name: 'endDate',
        humanName: 'End Date',
        resolvers: [
          'getFromUserIntent', 'getFromUser'
        ],
        resolved: false,
        results: {}
      }
    });

    this.resolvers = {
      'getFromUser': getFromUser,
      'getFromUserIntent': getFromUserIntent
    }

    this.master = new EventEmitter();
    this.master.on('resolveObjective', this.resolveObjective.bind(this));
    this.master.on('resolveObjectives', this.resolveObjectives.bind(this));
    this.master.on('objectivesResolved', this.objectivesResolved.bind(this));

    this.resolveObjectives = this.resolveObjectives.bind(this);
    this.objectivesResolved = this.objectivesResolved.bind(this);
    this.resolveObjective = this.resolveObjective.bind(this);
    this.objectiveResolved = this.objectiveResolved.bind(this);
    this.handleParameterFetched = this.handleParameterFetched.bind(this);

    this.master.emit('resolveObjectives');
  }

  resolveObjectives() {
    console.log('resolveObjectives'.green);
    let areAllResolved = true;
    console.log('?', this.objectives)
    this.objectives.forEach(item => {
      if (!item.resolved) {
        areAllResolved = false;
      }
    });

    if (areAllResolved) {
      this.master.emit('objectivesResolved');
    } else {
      this.objectives.forEach(item => {
        if (!item.resolved) {
          // resolve objective
          this.master.emit('resolveObjective', item);
        }
      })
    }
    // this.master.emit('resolveObjectives')

    // let objectives = goal.getObjectives()

    //Async, resolves objectives.
    //
    // let resolvedObjectives = Promise.all(objective.map(obj => {
    //   // create event emitter to wait for each resolver to complete
    //   return this.resolveObjective(obj);
    // }));
  }

  objectivesResolved() {
    console.log('objectivesResolved'.green);
    // parse to human readable
  }

  resolveObjective(objective) {
    console.log('resolveObjective'.green);
    // pass objective to resolver

    let resolverKey = objective.resolvers.first();
    this.master.emit(resolverKey, objective);

    this.master.on(`objective${objective.get('name')}Resolved`, this.objectiveResolved);
  }

  objectiveResolved(objective, results) {
    console.log('objectiveResolved'.green);
    this.objectives = this.objectives
      .updateIn([objective.get('name'), 'results'], results)
      .setIn([objective.get('name'), 'resolved'], true);
  }

  resolveObjective(objective) {
    console.log('resolveObjective'.green);
    if (objective.resolved) {
      return objective;
    }
  }

  handleParameterFetched() {}
}

module.exports = HistoryGoal;
