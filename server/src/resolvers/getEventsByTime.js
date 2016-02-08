import Thinky from 'thinky'
import EventEmitter from 'events';
import r from 'rethinkdb'
import _ from 'lodash'

let conn = {};

let p = r.connect({db: 'test'});
p.then(function(connection){
  conn = connection;
})


let socket = GLOBAL._socket;

class getEventsByTime {
  constructor() {
    this.resolverName = 'getEventsByTime';
  }

  async execute(message){
    return await this.getEvents(message, resolverDone)
  }

  async getEvents(message) {

    let {objective, target, params} = message;

    console.log('GETTING EVENTS'.rainbow, params);

    if (_.isUndefined(params.startDate) || _.isUndefined(params.endDate)){
      console.log('NO params');
      return;({ objective: objective, results: ['no results'], resolverName: this.resolverName, target: target})
    }

    let recentEvents = await this.getUrls(params.startDate, params.endDate);

    console.log('RECENT - ', recentEvents.length);

    return({ objective: objective, results: recentEvents, resolverName: this.resolverName, target: target});

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