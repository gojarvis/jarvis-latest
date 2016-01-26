import EventEmitter from 'events';
let socket = GLOBAL._socket;

class getFromUser {
  constructor(master) {
    console.log('RESOLVER GOT BUILT'.yellow);
    this.master = master;
    this.master.on('getFromUser', this.get);
  }

  get(objective) {
    console.log('hello master! i am here to server !'.blue, objective);

    // when done
    this.master.emit(`objective${paramaterName}Resolved`);
  }
}

module.exports = getFromUser;
