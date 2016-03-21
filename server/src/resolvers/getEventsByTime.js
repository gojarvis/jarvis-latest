import EventEmitter from 'events';
import r from 'rethinkdb'
import _ from 'lodash'




let socket = GLOBAL._socket;

class getEventsByTime {
  constructor() {
    this.resolverName = 'getEventsByTime';
    this.conn = GLOBAL.rethinkdbConnection
  }

  async execute(message){

    let result = await this.getEvents(message)
    return result
  }

  async getEvents(message) {

    let {objective, target, params} = message;

    console.log('GETTING EVENTS'.rainbow, params);


    let recentEvents = await this.getUrls(params.get('startDate'), params.get('endDate'));

    console.log('RECENT - ', recentEvents.length);

    return({ objective: objective, results: recentEvents, resolverName: this.resolverName, target: target});

  }

  getRethinkEvents(start, end){
    var self = this;
    return new Promise(function(resolve, reject) {

      r.table('Event').filter(
        r.row('timestamp').during(new Date(start), new Date(end), {leftBound: "open", rightBound: "open"}))
        .run(self.conn).then(function(cursor){

          return cursor.toArray()
        }).then(function(result){
          // console.log('YAY!!!'.rainbow);
          resolve(result)
        })
    });
  }

  getUrls(start, end){
    var self = this;
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
        .limit(20)
        .run(self.conn).then(function(cursor){

          return cursor.toArray()
        }).then(function(result){
          console.log('YAY!!!'.rainbow);
          resolve(result)
        })
    });
  }

  getFiles(start, end){
    var self = this;
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
        .run(self.conn).then(function(cursor){

          return cursor.toArray()
        }).then(function(result){
          console.log('YAY!!!'.rainbow);
          resolve(result)
        })
    });
  }
}

module.exports = getEventsByTime;
