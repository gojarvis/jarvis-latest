import imm from 'immutable';
import {OrderedSet, Map, List} from 'immutable';
import colors from 'colors';


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
    // let results = await Promise.all(this.jobs.map(job => {
    //   console.log('EXECUTING'.cyan, this.name, job.id);
    //   return this.processTask(job)
    // }))

    let results = OrderedSet();
    let jobs = this.jobs.toJS();

    for (let job of jobs){
      console.log('Launching'.red, this.name.toString().green, job);
      let res = await this.processTask(job)
      console.log('Done');
    }



    // this.jobs.forEach((job) =>{
    //   let res = await processTask(job);
    //   results = results.add(res);
    // });


    console.log('Finished process'.green, results);

    this.allDone()
    return results;
  }

  async processTask(job){
    // let self = this;
    // return new Promise(function(resolve, reject) {
    //   self.processor(job).then(function(result){
    //     console.log('Processor complete'.cyan, result);
    //     self.jobDone(result)
    //     resolve(result)
    //   })
    // });
    let result = await this.processor(job);
    this.jobDone(result);
    return result

  }
}

module.exports = Queue;
