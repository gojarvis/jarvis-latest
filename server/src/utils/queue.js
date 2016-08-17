let imm = require('immutable');
let {OrderedSet, Map, List} = require('immutable');
let colors = require('colors');


class Queue{
  constructor(options){
    // console.log('Creating queue'.green, options);
    let {name, processor, taskDone, allDone} = options;
    this.processor = processor;
    this.jobs = OrderedSet();
    this.jobDone = taskDone
    this.allDone = allDone
    this.cursor = 0;
    this.name = name;

  }

  queue(message){
    let job = {
      id: this.cursor,
      message: message
    };

    this.jobs = this.jobs.add(job)
    this.cursor++;
    return job;

  }

  async process(){
    console.log('processing'.magenta, this.name, this.jobs.toJS());
    let results = OrderedSet();
    let jobs = this.jobs.toJS();

    for (let job of jobs){
      console.log('Launching'.red, this.name.toString().green, job);
      let res = await this.processTask(job)
      console.log('Done');
    }

    console.log('Finished process'.green, results);

    this.allDone()
    return results;
  }

  async processTask(job){
    let result = await this.processor(job);
    this.jobDone(result);
    return result

  }
}

module.exports = Queue;
