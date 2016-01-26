import EventEmitter from 'events';
let socket = GLOBAL._socket;

class getFromUser {
  constructor(master) {
    console.log('RESOLVER GOT BUILT'.yellow);
    this.master = master;
    this.resolverName = 'getFromUser';

    this.master.on('getFromUser', this.get.bind(this));

    this.get = this.get.bind(this)
  }

  get(objective) {
    console.log('hello master! i am here to server !'.blue, objective);
    console.log('emitting:', `objective${this.resolverName}Resolved`, this.master);
    // when done
    this.master.emit(`objectiveResolved`, { objective: objective, results: 'hello from the other side!'});
  }
}

module.exports = getFromUser;
