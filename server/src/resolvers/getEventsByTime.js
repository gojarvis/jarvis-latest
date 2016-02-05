import Thinky from 'thinky'
import EventEmitter from 'events';
import r from 'rethinkdb'

var db = Thinky();
var type = db.type;

let socket = GLOBAL._socket;

class getEventsByTime {
  constructor(master) {
    this.master = master;
    this.resolverName = 'getEventsByTime';

    this.master.on('getEventsByTime', this.getEvents.bind(this));


  }

  async getEvents(message) {
    let params = message.params.toJS();
    console.log('GETTING EVENTS'.magenta, fact);

    let recentEvents = await this.getRethinkEvents(params.startDate, params.endDate);
    console.log('RECENT', recentEvents);
    // this.master.emit('resolverDone', { objective: objective, results: recentEvents, resolverName: this.resolverName});



  }

  getRethinkEvents(start, end){
    console.log('START', start, 'END', end);
    start = '2016-02-05T01:17:37.000-08:00';
    end = '2015-02-05T01:17:37.000-08:00'
    return new Promise(function(resolve, reject) {
      try{
        //TODO:
        return r.table('Event').filter(
          r.row('timestamp').during(new Date(start), new Date(end), {leftBound: "open", rightBound: "open"}))
      }
      catch(e){

        reject(err)
      }
    });
  }
}

module.exports = getEventsByTime;
