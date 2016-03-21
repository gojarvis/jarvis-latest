import imm from 'immutable';
import {Map, List} from 'immutable';
import EventEmitter from 'events';
import colors from 'colors';
import async from 'async'
import _ from 'lodash'
import Immutable from 'immutable'
import kue from 'kue';
import Resolvers from '../resolvers'
import Queue from '../utils/queue'


// console.log('RESOLVERS'.yellow, Resolvers);
let resultPool = imm.Map();

class Goal{
  constructor(){

    this.objectivesQueue = new Queue({
      name: 'objectives',
      processor: this.objectiveProcessor.bind(this),
      taskDone: this.objectiveDone,
      allDone: this.allObjectivesDone.bind(this)
    })

    this.resultPool = imm.Map();


  }

  async execute(goalDone, objectives, parsedIntent){

    this.objectives = imm.fromJS(objectives);
    this.parsedIntent = imm.fromJS(parsedIntent);
    this.goalDone = goalDone;

    let objectivesJobs = this.objectives.map(objective => {
      return this.objectivesQueue.queue(objective);
    });

    console.log(objectivesJobs, this.objectivesQueue);

    this.objectivesQueue.process();

    // //
    // this.objectiveCounter = imm.fromJS(objectiveJobs);
    //
    // this.numObjectives = objectiveJobs.length;
    //
    // console.log('####### Done queuing objectives'.yellow, objectiveJobs.length);
    //
    // this.queue.process('objective', 1, function(job, ctx, done){
    //   this.objectiveProcessor(job, ctx, done);
    // }.bind(this));
    //
    // this.callGoalDone = () => {
    //   console.log('Calling Goal done'.green, resultPool);
    //   goalDone(resultPool);
    // }
    //
    // console.log('Created '.green, objectiveJobs, ' jobs', objectiveJobs);

  }

  async objectiveProcessor(job){
    console.log('objective'.yellow, job.id);

    let {id, message} = job;
    let objective = message;

    let resolversQueue = new Queue({
      name: 'resolvers',
      processor: this.resolverProcessor.bind(this),
      taskDone: this.resolverDone,
      allDone: this.allResolversDone.bind(this)
    })

    let resolvers = message.get('resolvers');


    let resolversJobs = resolvers.map(resolver => {
      let message = imm.fromJS({
        resolver: resolver,
        objective: objective

      })
      return resolversQueue.queue(message);
    });



    let result = await resolversQueue.process();
    return result

  }

  async resolverProcessor(job){

    let {id, message} = job;
    let resolverSpec = message.get('resolver');
    let objective = message.get('objective');
    let resolverName = resolverSpec.get('name');


    let resolver = new Resolvers[resolverName]();
    console.log('Resolver'.green, resolverName);

    let prepared = this.prepareResolver(resolverSpec, objective);

    let resolverResult = await resolver.execute(prepared);
    let {target, results} = resolverResult;
    this.resultPool = this.resultPool.set(target, results)


    return results
  }

  async objectiveDone(result){
    console.log('Objcetive done'.green, result);
  }

  async allObjectivesDone(){
    console.log('all objectives done'.rainbow);
    console.log(this.resultPool.toJS());
    this.goalDone(this.resultPool);
  }

  async resolverDone(result){
    // console.log('Resolver done'.red, result);
  }

  async allResolversDone(){
    this.objectiveDone()
  }





  prepareResolver(resolverSpec, objective){
    let params = resolverSpec.get('params');
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
    // console.log('INTENT'.green, resultPool, intent);
    let target = resolverSpec.get('target');
    let message = {
      objective: objective,
      params: populated,
      target: target,
      intent: intent
    };

    console.log('Done prepping'.yellow, resolverSpec.get('name'));

    return message

  }



}

module.exports = Goal;
