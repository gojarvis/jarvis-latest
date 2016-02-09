import imm from 'immutable';
import {Map, List} from 'immutable';
import EventEmitter from 'events';
import colors from 'colors';
import async from 'async'
import _ from 'lodash'
import Immutable from 'immutable'
import kue from 'kue';
import Resolvers from '../resolvers'


let resultPool = imm.Map();

class Goal{
  constructor(){
    this.queue = kue.createQueue();

    kue.Job.rangeByState( 'complete', 0, 1000, 'asc', function( err, jobs ) {
      jobs.forEach( function( job ) {
        job.remove( function(){
          console.log( 'removed ', job.id );
        });
      });
    });
  }

  async execute(goalDone, objectives, parsedIntent){
    console.log('Executing'.green, parsedIntent);
    this.objectives = imm.fromJS(objectives);
    this.parsedIntent = imm.fromJS(parsedIntent);
    resultPool = imm.Map();

    let objectiveJobs = await Promise.all(this.objectives.map(objective => {
      return this.queueObjective(objective);
    }))
    //
    this.objectiveCounter = imm.fromJS(objectiveJobs);

    this.numObjectives = objectiveJobs.length;

    console.log('####### Done queuing objectives'.yellow, objectiveJobs.length);

    this.queue.process('objective', 1, function(job, ctx, done){
      this.objectiveProcessor(job, ctx, done);
    }.bind(this));

    this.callGoalDone = () => {
      console.log('Calling Goal done'.green, resultPool);
      goalDone(resultPool);
    }

    console.log('Created '.green, objectiveJobs, ' jobs', objectiveJobs);

  }

  async objectiveProcessor(job, ctx, objectiveDone){

    let objective = job.data.message;
    let resolvers  = Immutable.fromJS(objective.resolvers);

    let resolversJobs = await Promise.all(resolvers.map(resolver => {
        return this.prepareResolver(resolver, objective, objectiveDone);
    }));

    this.resolverCounter = imm.fromJS(resolversJobs);

    console.log('Created resolver jobs'.green, resolversJobs);
    console.log('******** ****** ***** Starting proccesing resolvers ******** ****** ***** '.green);

    this.queue.process('resolver', 1, function(job, ctx, resolverDone){
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
    let resolver = new Resolvers[resolverName]();
    let resolverResult = await resolver.execute(message);
    let {target, results} = resolverResult;

    console.log('Done with resolver', resolverName, results);
    resultPool = resultPool.set(target, results)

    console.log('Set in results', resultPool);
    setTimeout(()=>{
      console.log('setTimeout'.magenta, resolverName);
      resolverDone()
    },4000)
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

        let targetValue = resultPool.get(paramValue)
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
    // console.log('INTENT'.green, resultPool, intent);
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

  handleObjectiveDone(job, result){
    console.log('Objective done'.green, job.data);
    this.objectiveCounter = this.objectiveCounter.pop();
    console.log('@@@@@@@@@-------Objectives left:'.yellow, this.objectiveCounter.count());
    if (this.objectiveCounter.isEmpty()){
      this.callGoalDone();
    }
  }

  handleResolverJobDone(job, result){
    console.log('Resolver name'.green, job.data);
    this.resolverCounter = this.resolverCounter.pop();
    console.log('@@@@@@@@@-------Resolvers left'.yellow, this.resolverCounter.count());
    if (this.resolverCounter.isEmpty()){
      this.callObjectiveDone();
    }
  }

  queueObjective(objective) {
    let self = this;
    return new Promise(function(resolve, reject) {
      let objectiveName = objective.get('name');

      let job = self.queue.create('objective', {
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

      console.log('Queueing resolver'.yellow, resolverName, message);
      let job = self.queue.create('resolver', {
          resolverName: resolverName,
          message: message
      })

      job.once('complete', function(result){
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
