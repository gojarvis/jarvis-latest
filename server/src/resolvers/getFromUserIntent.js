import EventEmitter from 'events';
let socket = GLOBAL._socket;

class getFromUserIntent {
  constructor(master) {
    this.master = master;
    this.master.on('getFromUserIntent', this.get);
  }

  get(objective) {
    console.log('hello!', objective);

    // when done
    this.master.emit(`objective${paramaterName}Resolved`);
  }
}

module.exports = getFromUserIntent;
