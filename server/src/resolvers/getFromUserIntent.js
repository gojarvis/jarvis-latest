import EventEmitter from 'events';
let socket = GLOBAL._socket;

class getFromUserIntent {
  constructor(master) {
    this.master = master;
    this.master.on('getFromUserIntent', this.get.bind(this));

  }


  //needs to be a Map
  get(message) {
    let {objective, target, params, intent}  = message;

    // console.log('YO', objective, target, params, intent);
    let path = params.get('path');
    //Extract the value from the intent
    let value = intent.getIn(path);

    // when done
    this.master.emit('resolverDone', { objective: objective, results: value, resolverName: 'getFromUserIntent', target: target});
  }


}

module.exports = getFromUserIntent;
