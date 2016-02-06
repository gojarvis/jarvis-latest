import Thinky from 'thinky'
import EventEmitter from 'events';
import r from 'rethinkdb'

let conn = {};

let p = r.connect({db: 'test'});
p.then(function(connection){
  conn = connection;
})


let socket = GLOBAL._socket;

class getEventsByTime {
  constructor(master) {
    this.master = master;
    this.resolverName = 'getEventsByTime';
    console.log('GETTING EVENT BY TIME');

    this.master.on('getEventsByTime', this.getEvents.bind(this));

    this.getEvents = this.getEvents.bind(this);
  }

  async getEvents(message) {

    let {objective,callback} = message;
    let params = message.params;

    console.log('GETTING EVENTS'.rainbow, params);

    let recentEvents = await this.getUrls(params.startDate, params.endDate);
    console.log('RECENT - ', recentEvents.length);

    this.master.emit('resolverDone', { objective: objective, results: recentEvents, resolverName: this.resolverName, callback: callback});



  }

  getRethinkEvents(start, end){
    return new Promise(function(resolve, reject) {

      r.table('Event').filter(
        r.row('timestamp').during(new Date(start), new Date(end), {leftBound: "open", rightBound: "open"}))
        .run(conn).then(function(cursor){

          return cursor.toArray()
        }).then(function(result){
          // console.log('YAY!!!'.rainbow);
          resolve(result)
        })
    });
  }

  getUrls(start, end){
    return new Promise(function(resolve, reject) {
      r.table('Event').filter({source: 'chrome'})
        .filter(
          r.row('timestamp').during(
            new Date(start),
            new Date(end),
            {leftBound: "open", rightBound: "open"}))
        .filter({ source: 'chrome'})
        .filter(r.row('data').hasFields('url'))
        .pluck({data: { url : "url" } })
        .filter(r.row('data').hasFields('url'))
        .group(function(item){return item('data')('url')('url')})
        .ungroup()
        .merge(function(row){ return {count: row('reduction').count()} })
        .orderBy( r.desc('count') )
        .pluck('count', 'group')
        .run(conn).then(function(cursor){

          return cursor.toArray()
        }).then(function(result){
          console.log('YAY!!!'.rainbow);
          resolve(result)
        })
    });
  }

  getFiles(start, end){
    return new Promise(function(resolve, reject) {
      r.table('Event').filter(
        r.row('timestamp').during(
          new Date(start),
          new Date(end), {leftBound: "open", rightBound: "open"}
        ))
        .filter({ source: 'atom'})
        .group(function(item){ return item('data')('uri')})
        .ungroup()
        .merge(function(row){ return {count: row('reduction').count()} })
        .orderBy( r.desc('count') )
        .run(conn).then(function(cursor){

          return cursor.toArray()
        }).then(function(result){
          console.log('YAY!!!'.rainbow);
          resolve(result)
        })
    });
  }
}

module.exports = getEventsByTime;
