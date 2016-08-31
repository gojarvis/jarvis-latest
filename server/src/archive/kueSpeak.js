let queue = kue.createQueue();

let kue = require('kue')


class speaker{
  constructor(){

  }

  speak(origin, message){
    this.queueMessage(origin, message);
  }

  queueMessage(origin, message){

  }

}
