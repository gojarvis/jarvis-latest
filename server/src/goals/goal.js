import imm from 'immutable';
import {Map, List} from 'immutable';
import Resolvers from '../resolvers';
import EventEmitter from 'events';
import colors from 'colors';
import async from 'async'
import _ from 'lodash'

import kue from 'kue';

let queue = kue.createQueue();

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
    m.on('resolveObjectives', this.resolveObjectives.bind(this));
    m.on('allObjectivesResolved', this.allObjectivesResolved.bind(this));
    m.on('objectiveResolved', this.objectiveResolved.bind(this));
    m.on('resolverDone', this.resolverDone.bind(this));

    this.master = m;



    this.allObjectivesResolved = this.allObjectivesResolved.bind(this);
    this.objectiveResolved = this.objectiveResolved.bind(this);
    this.handleParameterFetched = this.handleParameterFetched.bind(this);
    this.resolverDone = this.resolverDone.bind(this)




    //moved this to the specific goal executing
    // this.master.emit('resolveObjectives');
  }

  resolveObjectives() {

    //Parse the intent, and
    let objectiveJobs = await Promise.all(this.objectives.map(objective => {
      return this.queueObjective(objective);
    }))


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

  queueObjective(objective) {

    //Initialize only the resolvers required for this objective
    //They are just going to sit there and listen for events
    this.initializeResolvers(objective.get('resolvers'))


    //Here we add the objective to the queue
    return new Promise(function(objective, reject) {
      let objectiveName = objective.get('name');
      let job = queue.create('objective', {
          name: objectiveName,
          message: objective.toJS()

      }).save( function(err){
         if( !err ) {
           console.log('Queued objective ', objectiveName, job.id );
           resolve({objectiveName: objectiveName, jobId: job.id})
         }
         else{
           console.log('ERROR'.red, err);
         }
      });
    });

    console.log('******** ****** ***** Done queuing objective ******** ****** ***** '.cyan);
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

  async prepareResolver(resolver, objective){
    console.log('Prepping Resolver: '.green, resolver.get('name'));

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

    console.log('Done prepping'.yellow, resolver.get('name'));

    let resolverName = resolver.get('name');
    let resolverJob = await queueResolver(resolverName, message)
    return resolverJob

  }

  queueResolver(resolverName, message){
    console.log('Adding '.yellow, resolverName.toString().green, ' to queue'.yellow);
    return new Promise(function(resolve, reject) {
      let job = queue.create('resolver', {
          name: resolverName,
          message: message

      }).save( function(err){
         if( !err ) {
           console.log('Queued resolver ', resolverName, job.id );
           resolve({resolverName: resolverName, jobId: job.id})
         }
         else{
           console.log('ERROR'.red, err);
         }
      });
    });
  }

  resolverDone(message){

    let { resolverName, objective, results, target } = message;

    console.log('RESOLVER DONE'.magenta, target, results);

    this.resultPool = this.resultPool.set(target, results);

    // console.log('SET RESULTS'.yellow, this.resultPool);
    this.lastExecutedResolverIndex += 1;

    if ( this.lastExecutedResolverIndex < this.resolvers.count() ){
      console.log('should call next'.yellow);
      // let nextResolver = this.resolvers.get(this.lastExecutedResolverIndex);
      // this.queueResolver(nextResolver)
    }
    //finished all resolver
    else{

      console.log('Objective is resolved: '.cyan, objective.get('name'));
      this.objectiveResolved(objective, results);
    }
  }

  objectiveResolved(objective, results) {
    // let {objective, results} = message
    console.log('objectiveResolved'.rainbow, objective.get('name'));
    // this.results = this.results
    //   .setIn([objective.get('name'), 'results'], results)
    //   .setIn([objective.get('name'), 'resolved'], true);

    // console.log('Objective resolved'.green, this.objectives.toJS());


    let updatedObjectives = this.objectives.shift();
    console.log('Remaining objectives'.red, this.objectives.toJS());
    this.objectives = updatedObjectives;


    console.log('updatedObjectives'.red, 'Done With: '.yellow, objective.get('name') );

    this.resolveObjectives()

    // this.master.emit('resolveObjectives');
    // this.socket.emit('speak', 'objective resolved');
  }

  handleParameterFetched() {}
}

module.exports = Goal;
