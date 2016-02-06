import imm from 'immutable';
import {Map, List} from 'immutable';
import Resolvers from '../resolvers';
import EventEmitter from 'events';
import colors from 'colors';
import async from 'async'
import _ from 'lodash'
import Immutable from 'immutable'
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
    // m.on('objectiveResolved', this.objectiveResolved.bind(this));
    m.on('resolverDone', this.resolverDone.bind(this));

    this.master = m;



    //moved this to the specific goal executing
    // this.master.emit('resolveObjectives');
  }

  async resolveObjectives() {

    //Parse the intent, and
    let objectiveJobs = await Promise.all(this.objectives.map(objective => {
      return this.queueObjective(objective);
    }))

    console.log('******** ****** ***** Starting proccesing objective ******** ****** ***** '.cyan);

    queue.process('objective', function(job, ctx, done){
      this.objectiveProcessor(job,ctx,done)
    }.bind(this));

    this.master.emit('allObjectivesResolved');

  }

  async objectiveProcessor(job, ctx, done){
    console.log(job.data.message);
    //call the objective resolvers
    let objective = job.data.message;
    let resolvers  = Immutable.fromJS(objective.resolvers);

    let resolversJobs = await Promise.all(resolvers.map(resolver => {
        return this.prepareResolver(resolver, objective);
    }));

    console.log('Created resolver jobs'.green, resolversJobs);
    console.log('******** ****** ***** Starting proccesing resolvers ******** ****** ***** '.green);

    queue.process('resolver', function(job, ctx, done){
      this.resolverProcessor(job,ctx,done)
    }.bind(this))

    queue.on('job complete', function(job){
      console.log('job complete'.yellow, job);
    })

    done()

  }



  allObjectivesResolved() {
    console.log('All objectives resolved'.green);
    // console.log(this.results);

    //This should call the overriding function by the goal implementation
    //TODO: Make sure this function is always defined
    this.objectivesResolved()
  }

  queueObjective(objective) {

    //Initialize only the resolvers required for this objective
    //They are just going to sit there and listen for events
    // this.initializeResolvers(objective.get('resolvers'))


    //Here we add the objective to the queue
    return new Promise(function(resolve, reject) {
      let objectiveName = objective.get('name');

      let job = queue.create('objective', {
          name: objectiveName,
          message: objective.toJS()

      }).save( function(err){
         if( !err ) {
           resolve({objectiveName: objectiveName, jobId: job.id})
         }
         else{
           console.log('ERROR'.red, err);
         }
      });
    });


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
    let resolverJob = await this.queueResolver(resolverName, message)
    return resolverJob

  }

  resolverProcessor(job, ctx, done){
    let message = job.data.message;
    let resolverName = job.data.name;

    let _ghosts = new Resolvers[resolverName](this.master)


    message.callback = done;

    console.log('Emitting', resolverName);
    this.master.emit(resolverName, message)

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
    console.log('RESOLVER DONE'.rainbow);
    let { resolverName, objective, results, target , callback} = message;

    this.resultPool = this.resultPool.set(target, results);

    //Complete the kue job (resolver)
    callback()

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
