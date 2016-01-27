import imm from 'immutable';
import {Map, List} from 'immutable';
import {getFromUser, getFromUserIntent} from '../resolvers';
import EventEmitter from 'events';
import colors from 'colors';

class Goal {
  constructor(objectives, resolvers) {
    this.objectives = imm.fromJS(objectives);
    this.results = imm.fromJS(objectives);



    this.socket = GLOBAL._socket;
    let m = new EventEmitter();
    m.on('resolveObjective', this.resolveObjective.bind(this));
    m.on('resolveObjectives', this.resolveObjectives.bind(this));
    m.on('allObjectivesResolved', this.allObjectivesResolved.bind(this));
    m.on('objectiveResolved', this.objectiveResolved.bind(this));

    this.master = m;


    this.resolvers = Map(resolvers).map((resolver, key) => {
      return new resolver(this.master)
    })

    this.resolveObjectives = this.resolveObjectives.bind(this);
    this.allObjectivesResolved = this.allObjectivesResolved.bind(this);
    this.resolveObjective = this.resolveObjective.bind(this);
    this.objectiveResolved = this.objectiveResolved.bind(this);
    this.handleParameterFetched = this.handleParameterFetched.bind(this);

    this.master.emit('resolveObjectives');
  }

  resolveObjectives() {
    if (this.objectives.count() > 0){
      let focusObjectives = this.objectives.first();
      this.master.emit('resolveObjective', focusObjectives);
    }
    else {
      this.allObjectivesResolved()
    }
  }

  allObjectivesResolved() {
    console.log('All objectives resolved'.green);
    console.log(this.results);
    this.objectivesResolved()
  }



  resolveObjective(objective) {
    let resolverKey = objective.get('resolvers').first();
    console.log('resolver is being called:'.green, resolverKey.toString().yellow);
    this.master.emit(resolverKey, objective);

  }

  objectiveResolved(message) {
    let {objective, results} = message
    this.results = this.results
      .setIn([objective.get('name'), 'results'], results)
      .setIn([objective.get('name'), 'resolved'], true);

    // console.log('Objective resolved'.green, this.objectives.toJS());


    let updatedObjectives = this.objectives.delete(objective.get('name'));
    this.objectives = updatedObjectives;

    this.resolveObjectives()
    // this.master.emit('resolveObjectives');
    // this.socket.emit('speak', 'objective resolved');
  }



  handleParameterFetched() {}
}

module.exports = Goal;
