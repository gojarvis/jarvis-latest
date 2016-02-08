import imm from 'immutable';
import {Map, List} from 'immutable';
import EventEmitter from 'events';
import colors from 'colors';
import async from 'async'
import _ from 'lodash'
import Immutable from 'immutable'
import kue from 'kue';
import Resolvers from '../resolvers'

let queue = kue.createQueue();

class Goal{
  constructor(objectives, parsedIntent){
      this.objectives = imm.fromJS(objectives);
      this.parsedIntent = imm.fromJS(parsedIntent);
      this.objectiveIndex = 0;
      this.resolverIndex = 0;

      this.resultPool = imm.Map();
  }

  async initialize(goalDone){
    //add objectives to queue
    console.log('initialize'.green);
    this.resultPool = imm.Map();
    let objectiveJobs = await Promise.all(this.objectives.map(objective => {
      return this.queueObjective(objective);
    }))
    //

    this.numObjectives = objectiveJobs.length;

    console.log('####### Done queuing objectives'.yellow, objectiveJobs.length);

    queue.process('objective', function(job, ctx, done){
      this.objectiveProcessor(job, ctx, done);
    }.bind(this));

    this.callGoalDone = function(){
      console.log('Calling Goal done'.green);
      goalDone(this.resultPool);
    }

    console.log('Created '.green, objectiveJobs, ' jobs', objectiveJobs);

  }

  async objectiveProcessor(job, ctx, objectiveDone){

    let objective = job.data.message;
    let resolvers  = Immutable.fromJS(objective.resolvers);

    let resolversJobs = await Promise.all(resolvers.map(resolver => {
        return this.prepareResolver(resolver, objective, objectiveDone);
    }));

    this.numResolvers = resolversJobs.length;

    console.log('Created resolver jobs'.green, resolversJobs);
    console.log('******** ****** ***** Starting proccesing resolvers ******** ****** ***** '.green);

    queue.process('resolver', function(job, ctx, resolverDone){
      this.resolverProcessor(job,ctx,resolverDone)
    }.bind(this))



    this.callObjectiveDone = function(){
      console.log('Calling objective done'.green);
      objectiveDone()
    }
  }


  async resolverProcessor(job, ctx, resolverDone){
    let message = job.data.message;
    let resolverName = job.data.resolverName;
    console.log('Resolver Processor'.yellow, resolverName, message);
    let resolver = new Resolvers[resolverName]();

    let resolverResult = await resolver.execute(message);
    let {target, results} = resolverResult;

    console.log('Done with resolver', results);
    this.resultPool = this.resultPool.set(target, results)
    resolverDone()

  }

  async prepareResolver(resolver, objective, objectiveDone){
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

    let intent = this.parsedIntent;
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

  handleObjectiveDone(job, result,){
    this.objectiveIndex++;
    console.log('@@@@@@@@@-------objective done'.yellow, this.objectiveIndex, this.numObjectives);
    if (this.objectiveIndex === this.numObjectives){
      this.objectiveIndex = 0;
      this.callGoalDone();
    }
  }

  handleResolverJobDone(job, result){
    this.resolverIndex++;
    console.log('@@@@@@@@@-------resolver done'.yellow, this.resolverIndex, this.numResolvers);
    if (this.resolverIndex === this.numResolvers){
      this.resolverIndex = 0;
      this.callObjectiveDone();
    }
  }

  queueObjective(objective) {
    let self = this;
    return new Promise(function(resolve, reject) {
      let objectiveName = objective.get('name');

      let job = queue.create('objective', {
          name: objectiveName,
          message: objective

      })

      job.on('complete', function(result){
        console.log('OBJECTIVE JOB COMPLETE');
        self.handleObjectiveDone(job, result)
      })

      job.save( function(err){
         if( !err ) {
           resolve({objectiveName: objectiveName, jobId: job.id})
         }
         else{
           console.log('ERROR'.red, err);
         }
      });
    });
  }

  queueResolver(resolverName, message){
    let self = this;
    return new Promise(function(resolve, reject) {

      console.log('Queueing resolver'.yellow, resolverName);
      let job = queue.create('resolver', {
          resolverName: resolverName,
          message: message
      })

      job.on('complete', function(result){
        console.log('RESOLVER JOB COMPLETE');
        self.handleResolverJobDone(job, result)
      })

      job.save( function(err){
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


}

module.exports = Goal;
