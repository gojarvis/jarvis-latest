let imm = require('immutable')
let {Map, List} = require('immutable')
let EventEmitter = require('events')
let colors = require('colors')
let async = require('async')
let _ = require('lodash')
let Immutable = require('immutable')
let kue = require('kue')



class Goal {
  constructor(objectives, parsedIntent) {
    this.Resolvers = require('../resolvers');
    this.queue = kue.createQueue();

    console.log('&&&&&&&&&&&&&&&&&&&&&& GOAL &&&&&&&&&&&&&&&&&&&&&&'.red);
    this.objectives = Map();
    this.objectives = imm.fromJS(objectives);


    console.log('&&&&&&&&&&&&&&&&&&&&&& Objectives &&&&&&&&&&&&&&&&&&&&&&'.red, this.objectives.count());

    if (!_.isUndefined(this.resultPool)){
      console.log('OOOOOOOOOOPPPPS'.red, this.resultPool);
    }

    this.parsedIntent = parsedIntent;

    this.resultPool = Map();
    this.resultPool = this.resultPool.set('intent', parsedIntent);
    // console.log('RESULT POOL'.yellow, this.resultPool);

    this.resolverExecuting = false;
    this.lastExecutedResolverIndex = 0;

    this.socket = global._socket;

    this.listeners = List();

    let m = new EventEmitter();
    m.once('resolveObjectives', () => {
      setImmediate(() => {
        this.resolveObjectives()
      })
    });
    // m.on('allObjectivesResolved', this.allObjectivesResolved.bind(this));
    // m.on('objectiveResolved', this.objectiveResolved.bind(this));
    m.on('resolverDone', (message)=> {
      setImmediate(() => {
        this.resolverDone(message)
      })
    });


    this.master = m;


    this.rmOB = 0;
    this.rmRS = 0;
    // this.allObjectivesResolved = this.allObjectivesResolved.bind(this);
    this.resolverDone = this.resolverDone.bind(this);
    this.resolveObjectives = this.resolveObjectives.bind(this);


    //moved this to the specific goal executing
    // this.master.emit('resolveObjectives');
  }


  async resolveObjectives() {
    let self = this;
    //Parse the intent, and
    let objectiveJobs = await Promise.all(this.objectives.map(objective => {
      self.rmOB = self.rmOB + 1
      return this.queueObjective(objective);
    }))

    console.log('******** ****** ***** Starting proccesing objective ******** ****** ***** '.cyan);

    self.queue.process('objective', function(job, ctx, done){

      this.objectiveProcessor(job,ctx,done)

    }.bind(this));

    self.queue.on('job complete', function(id, result){
      console.log('JOB COMPLETE ', id);
      kue.Job.get(id, function(err, job){
        console.log('found job', job.type);
        if (err) return;
        if (job.type === 'objective'){
          self.rmOB = self.rmOB - 1;
          console.log('Completed objective'.magenta, self.rmOB);
          if (self.rmOB === 0){
            this.master.emit('allObjectivesResolved', this.resultPool)
          }

          job.remove(function(err){
            if (err) throw err;
            console.log('removed completed job #%d'.yellow, job.id);
          });
        }

      }.bind(this));
    }.bind(this));
  }

  async objectiveProcessor(job, ctx, objectiveDone){
    let self = this;
    console.log('##### Objective Processor'.yellow, self.rmRS);
    // console.log(job.data.message);
    //call the objective resolvers
    let objective = job.data.message;
    let resolvers  = Immutable.fromJS(objective.resolvers);

    let resolversJobs = await Promise.all(resolvers.map(resolver => {

        return this.prepareResolver(resolver, objective, objectiveDone);
    }));

    console.log('Created resolver jobs'.green, resolversJobs);
    console.log('******** ****** ***** Starting proccesing resolvers ******** ****** ***** '.green);

    self.queue.process('resolver', function(job, ctx, done){

      this.resolverProcessor(job,ctx,done)
    }.bind(this))

  }

  allObjectivesResolved(results) {

    console.log('All objectives resolved'.green, this.resultPool);
    // console.log(this.results);

    //This should call the overriding function by the goal implementation
    //TODO: Make sure this function is always defined
    // this.objectivesResolved()
  }

  queueObjective(objective) {
    let self = this;
    //Initialize only the resolvers required for this objective
    //They are just going to sit there and listen for events
    // this.initializeResolvers(objective.get('resolvers'))


    //Here we add the objective to the queue
    return new Promise(function(resolve, reject) {
      let objectiveName = objective.get('name');

      let job = self.queue.create('objective', {
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

  async prepareResolver(resolver, objective, objectiveDone){
    let self = this;
    self.rmRS = self.rmRS + 1;
    console.log('Prepping Resolver: '.green, resolver.get('name'), self.rmRS);
    let params = resolver.get('params');
    let populated = params.map((paramValue, paramName) => {
      //If the first char in the param is $, fetch it from the global results
      console.log('PARAMS'.green, '|||'.yellow, paramName, paramValue);
      let populatedItem = Map();
      if (paramValue[0] === "$"){
        paramValue = paramValue.replace('$', '');
        // console.log('PARAMVALUE'.cyan, paramValue);

        let targetValue = self.resultPool.get(paramValue)
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

    let intent = self.resultPool.get('intent');
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
    let resolverJob = await this.queueResolver(resolverName, message, objectiveDone)
    return resolverJob

  }

  resolverProcessor(job, ctx, done){
    let message = job.data.message;
    let resolverName = job.data.name;

    let _ghosts = new this.Resolvers[resolverName](this.master)


    message.callback = done;

    console.log('Emitting', resolverName);
    this.master.emit(resolverName, message)

  }

  handleResolverJobDone(doneJob, result, objectiveDone){

    let self = this;
    console.log('################################# resolver job complete ######################'.green, self.rmRS);
    kue.Job.get(doneJob.id, function(err, job){
      if (err) return;
      if (job.type === 'resolver'){
        self.rmRS = self.rmRS - 1;
        console.log('REMAINING RESOLVERS'.red, self.rmRS, self.rmOB, 'TYPE'.yellow, job.type);

        if (self.rmRS <= 0){
          objectiveDone()

          console.log('All resolvers are done');
        }

        job.remove(function(err){
          if (err) throw err;
          console.log('removed completed job #%d', job.id);
        });
      }
    });
  }

  queueResolver(resolverName, message, objectiveDone){
    let self = this;
    console.log('Adding '.yellow, resolverName.toString().green, ' to queue'.yellow);
    return new Promise(function(resolve, reject) {
      let job = self.queue.create('resolver', {
          name: resolverName,
          message: message

      })

      job.once('complete', function(result){
        self.handleResolverJobDone(job, result, objectiveDone)
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

  resolverDone(message){
    let { resolverName, objective, results, target , callback} = message;
    console.log('RESOLVER DONE'.rainbow, target, objective);
    this.resultPool = this.resultPool.set(target, results);
    console.log('AFTER RESOLVER DONE'.red, this.resultPool);
    //Complete the kue job (resolver)
    callback()

  }


  handleParameterFetched() {}
}

module.exports = Goal;
