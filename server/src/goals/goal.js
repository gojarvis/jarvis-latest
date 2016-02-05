import imm from 'immutable';
import {Map, List} from 'immutable';
import Resolvers from '../resolvers';
import EventEmitter from 'events';
import colors from 'colors';
import async from 'async'
import _ from 'lodash'

class Goal {
  constructor(objectives, parsedIntent) {

    this.objectives = imm.fromJS(objectives);
    this.results = imm.fromJS(objectives);
    this.resolvers = List();

    this.parsedIntent = parsedIntent;
    this.resultPool = Map();
    this.resultPool = this.resultPool.set('intent', parsedIntent);
    // console.log('RESULT POOL'.yellow, this.resultPool);

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



    this.resolveObjectives = this.resolveObjectives.bind(this);
    this.allObjectivesResolved = this.allObjectivesResolved.bind(this);
    this.resolveObjective = this.resolveObjective.bind(this);
    this.objectiveResolved = this.objectiveResolved.bind(this);
    this.handleParameterFetched = this.handleParameterFetched.bind(this);
    this.resolverDone = this.resolverDone.bind(this)

    //moved this to the specific goal executing
    // this.master.emit('resolveObjectives');
  }

  resolveObjectives() {

    //Parse the intent, and



    if (this.objectives.count() > 0){
      let focusObjective = this.objectives.first();
      console.log('RESOLVE OBJ'.red, focusObjective);
      this.master.emit('resolveObjective', focusObjective);
    }
    else {
      this.allObjectivesResolved()
    }
  }

  allObjectivesResolved() {
    console.log('All objectives resolved'.green);
    // console.log(this.results);

    //This should call the overriding function by the goal implementation
    //TODO: Make sure this function is always defined
    this.objectivesResolved()
  }

  initializeResolvers(resolvers){
    this.resolvers = resolvers;
    console.log('Initializaing resolvers'.rainbow, this.resolvers, this.resolvers.count());

    this.listeningResolvers = resolvers.map(resolver => {

        let resolverName = resolver.get('name');
        let ResolverClass = Resolvers[resolverName]
        console.log('MATER'.green);
        return new ResolverClass(this.master);
    })

    console.log('Initializained'.rainbow, this.listeningResolvers.count());
  }

  resolveObjective(objective) {


    // console.log('OBJECTIVE'.magenta, objective);
    // console.log('RESOLVERS'.magenta, objective.get('resolvers'));
    //Initialize only the resolvers required for this objective
    this.initializeResolvers(objective.get('resolvers'))

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
        // console.log('PARAMVALUE'.cyan, paramValue);

        let targetValue = this.resultPool.get(paramValue)
        // console.log('TARGETVALUE'.rainbow, targetValue);
        populatedItem =  targetValue;
        // console.log('FIILED'.rainbow, populatedItem);
      }
      else{
        populatedItem =  paramValue
      }
      // console.log('populatedItem'.green, populatedItem);
      return populatedItem;
    })

    // console.log('FULL'.rainbow, populated);

    let intent = this.resultPool.get('intent');
    // console.log('INTENT'.green, this.resultPool, intent);
    let target = resolver.get('target');
    let message = {
      objective: objective,
      params: populated,
      target: target,
      intent: intent
    };

    console.log('EMITTING'.yellow, resolver.get('name'));

    let resolverName = resolver.get('name');
    this.master.emit(resolverName, message);

  }

  resolverDone(message){

    let { resolverName, objective, results, target } = message;

    console.log('RESOLVER DONE'.green, target, results);

    this.resultPool = this.resultPool.set(target, results);

    // console.log('SET RESULTS'.yellow, this.resultPool);
    this.lastExecutedResolverIndex += 1;

    if ( this.lastExecutedResolverIndex < this.resolvers.count() ){
      console.log('should call next'.yellow);
      // let nextResolver = this.resolvers.get(this.lastExecutedResolverIndex);
      // this.executeResolver(nextResolver)
    }
    //finished all resolver
    else{
      this.objectiveResolved(objective, results);
      console.log('Objective is resolved'.green);
    }
  }

  objectiveResolved(objective, results) {
    // let {objective, results} = message
    // console.log('objectiveResolved', objective, results);
    this.results = this.results
      .setIn([objective.get('name'), 'results'], results)
      .setIn([objective.get('name'), 'resolved'], true);

    // console.log('Objective resolved'.green, this.objectives.toJS());


    let updatedObjectives = this.objectives.shift();
    this.objectives = updatedObjectives;


    console.log('updatedObjectives'.red, this.objectives, 'deleted', objective.get('name') );

    this.resolveObjectives()

    // this.master.emit('resolveObjectives');
    // this.socket.emit('speak', 'objective resolved');
  }

  handleParameterFetched() {}
}

module.exports = Goal;
