let queue = kue.createQueue();

import kue from 'kue'


class speaker{
  constructor(){

  }

  speak(origin, message){
    this.queueMessage(origin, message);
  }

  queueMessage(origin, message){

  }

}
