import imm from 'immutable';
import {Map, List} from 'immutable';
import {getFromUser, getFromUserIntent} from '../resolvers';
import EventEmitter from 'events';
import colors from 'colors';

class Goal {
  constructor(objectives, resolvers) {
    this.objectives = imm.fromJS(objectives);



    this.master = new EventEmitter();
    this.master.on('resolveObjective', this.resolveObjective.bind(this));
    this.master.on('resolveObjectives', this.resolveObjectives.bind(this));
    this.master.on('objectivesResolved', this.objectivesResolved.bind(this));


    this.resolvers = Map(resolvers).map((resolver, key) => {
      console.log(resolver, typeof resolver);
      return new resolver(this.master)
    })

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
      this.resolveObjectivesDone(this.objectives);
    } else {
      this.objectives.forEach(item => {
        if (!item.resolved) {
          // resolve objective
          this.master.emit('resolveObjective', item);
        }
      })
    }

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

module.exports = Goal;
