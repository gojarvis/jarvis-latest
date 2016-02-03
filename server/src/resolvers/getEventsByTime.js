import Thinky from 'thinky'
import EventEmitter from 'events';

var db = Thinky();
var type = db.type;

let socket = GLOBAL._socket;

class getEventsByTime {
  constructor(master) {
    this.master = master;
    this.resolverName = 'getEventsByTime';

    this.master.on('getEventsByTime', this.getEventsByTime.bind(this));

    this.save = this.save.bind(this)

  }

  async getEventsByTime(message) {
    console.log('saveFACT', message);
    let params = message.params.toJS();
    // console.log('FACT'.green, fact);

    let recentEvents = await this.getRethinkEvents(params.startDate, params.endDate);

    this.master.emit('resolverDone', { objective: objective, results: recentEvents, resolverName: this.resolverName});



  }

  getRethinkEvents(start, end){
    console.log('SAVEING IN RETHINK', fact.payload);
    return new Promise(function(resolve, reject) {
      try{
        //TODO:
      }
      catch(e){

        console.error('Fact Manager: error saving history event', e);
        reject(err)
      }
    });
  }
}

module.exports = getEventsByTime;
