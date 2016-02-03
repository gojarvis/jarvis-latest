import EventEmitter from 'events';
let socket = GLOBAL._socket;

class getFromUserIntent {
  constructor(master) {
    this.master = master;
    this.master.on('getFromUserIntent', this.get.bind(this));

  }


  //needs to be a Map
  get(message) {
    if (!message.isMap()){
      console.error('intent is not a map');
      return;
    }

    let params = message.get('params');
    let intent = message.get('intent');

    let path = params.path;

    //Extract the value from the intent
    let value = intent.getIn(path);


    console.log('hello!', objective);

    // when done
    // this.master.emit(`objective${paramaterName}Resolved`);
  }


}

module.exports = getFromUserIntent;
