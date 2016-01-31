import imm from 'immutable';
import {Map, List} from 'immutable';
import Resolvers from '../resolvers';
import EventEmitter from 'events';
import colors from 'colors';
import async from 'async'
import _ from 'lodash'

class Goal {
  constructor(objectives) {
    this.objectives = imm.fromJS(objectives);
    this.results = imm.fromJS(objectives);
    this.resolvers = List();

    this.resultPool = Map();

    this.resolverExecuting = false;
    this.lastExecutedResolverIndex = 0;

    this.socket = GLOBAL._socket;
    let m = new EventEmitter();
    m.on('resolveObjective', this.resolveObjective.bind(this));
    m.on('resolveObjectives', this.resolveObjectives.bind(this));
    m.on('allObjectivesResolved', this.allObjectivesResolved.bind(this));
    m.on('objectiveResolved', this.objectiveResolved.bind(this));
    m.on('resolverDone', this.resolverDone.bind(this));

    this.master = m;


    this.numResolvers = this.resolvers.count();

    this.resolveObjectives = this.resolveObjectives.bind(this);
    this.allObjectivesResolved = this.allObjectivesResolved.bind(this);
    this.resolveObjective = this.resolveObjective.bind(this);
    this.objectiveResolved = this.objectiveResolved.bind(this);
    this.handleParameterFetched = this.handleParameterFetched.bind(this);
    this.resolverDone = this.resolverDone.bind(this)

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

    //This should call the overriding function by the goal implementation
    //TODO: Make sure this function is always defined
    this.objectivesResolved()
  }


  initializeResolvers(resolvers){
    this.resolvers = resolvers;

    this.listeningResolvers = resolvers.map(resolver => {

        let resolverName = resolver.get('name');
        let ResolverClass = Resolvers[resolverName]
        console.log('MATER'.green);
        return new ResolverClass(this.master);
    })
  }


  resolveObjective(objective) {

    //Initialize only the resolvers required for this objective
    this.initializeResolvers(objective.get('resolvers'))

    //Now all resolvers are listening
    // let index = this.lastExecutedResolverIndex;
    // let currentResolver = this.listeningResolvers[index]
    // console.log(currentResolver);


    //Kick off the resolver
    this.executeResolver(objective.get('resolvers').first(), objective)



    // Prepare the data for the resolvers befor execution

    // Execute resolvers one by one



    // let resolvers = objective.get('resolvers').forEach(resolver => {
    //   let dependencies = {};
    //
    //   if (resolver.get('requires').get('dependencies').count() > 0){
    //       dependencies = this.getDependencies(resolver)
    //   }
    //
    //   resolver = resolver.set('resources', dependencies);
    //
    //   let resolverName = resolver.get('name');
    //   let resolverClass = Resolvers[resolverName]
    //
    //   let runner = new resolverClass(this.master);
    //
    //
    //
    // });

    // let resolverKey = objective.get('resolvers').first();
    //
    //
    // console.log('resolver is being called:'.green, resolverKey.toString().yellow);
    //
    // //Calls any resolvers listening on this key
    // // this.master.emit(resolverKey, {
    // //   target:
    // // });


  }

  getDependencies(resolver){
    let requirements = resolver.get('require');
    let dependencies = requirements.get('dependencies');
    let goalResults = imm.fromJS(this.results);
    let dependenciesResults  = [];
    try {
      dependenciesResults = dependencies.map(dependency => {
        return goalResults.get(dependency)
      })
    } catch (e) {
      console.log('could not find dependency'.red);

    } finally {
      return dependenciesResults;
    }
  }

  executeResolver(resolver, objective){
    console.log('EXECUTING'.green, resolver);

    let params = resolver.get('params');
    let populated = params.map((paramValue, paramName) => {
      //If the first char in the param is $, fetch it from the global results
      console.log('PARAMS'.green, '|||'.yellow, paramName, paramValue);
      let populatedItem = Map();
      if (paramValue[0] === "$"){
        paramValue = paramValue.replace('$', '');
        console.log('PARAMVALUE'.cyan, paramValue);

        let targetValue = this.resultPool.get(paramValue)
        console.log('TARGETVALUE'.rainbow, targetValue);
        populatedItem =  targetValue;
        console.log('FIILED'.rainbow, populatedItem);
      }
      else{
        populatedItem =  paramValue
      }
      console.log('populatedItem'.green, populatedItem);
      return populatedItem;
    })

    console.log('FULL'.rainbow, populated);

    let target = resolver.get('target');
    let message = {
      objective: objective,
      params: populated,
      target: target
    };

    console.log('EMITTING'.yellow, resolver.get('name'));

    let resolverName = resolver.get('name');
    this.master.emit(resolverName, message);

  }



  resolverDone(message){

    let { resolverName, objective, results, target } = message;

    console.log('RESOLVER DONE'.green, target, results);

    this.resultPool = this.resultPool.set(target, results);

    console.log('SET RESULTS'.yellow, this.resultPool);

    if ( this.lastExecutedResolverIndex <= this.resolvers.count() ){
      this.lastExecutedResolverIndex += 1;
      let nextResolver = this.resolvers.get(this.lastExecutedResolverIndex);
      console.log('RESOLVERS'.red, nextResolver);

      this.executeResolver(nextResolver)
      console.log('resolver ', resolverName, ' is done');
    }
    else{
      this.objectiveResolved(objective, results);
      console.log('Objective is resolved'.green);
    }




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
