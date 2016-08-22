let GraphUtils = require('../utils/graph')
let r = require('rethinkdb')
let moment = require('moment')

class HistoryReciever {
  constructor() {
    this.graph = new GraphUtils();

  }

  getResponse(user, entities){
    return new Promise(function(resolve, reject){
      console.log('entities', entities, user);
      // let history = this.getHistorics(username, start, end)
      let {date, grain} = this.getTargetDateTime(entities);
      let response = {
        speech : 'The user is ' + user.username,
        recommendations: []
      };



      console.log(response);
      resolve(response);
    })
  }

  getTargetDateTime(entities){
    if (!_.isUndefined(entities.datetime)){
        let item = entities.datetime[0];
        return {
          date: item.value,
          grain: item.grain
        }
    }
    else {
      return {
        date: moment().subtract(1, 'day').format(),
        grain: 'day'
      }
    }

  }

  getHistorics(username,start,end){
    return new Promise(function(resolve, reject) {
      r.table('Event').filter(r.row('timestamp')
      .during(new Date(start), new Date(end), {leftBound: "open", rightBound: "closed"}))
      .filter({user: username}).run(connection).then(function(cursor){
        return cursor.toArray();
      }).then(function(result){
        resolve(result);
      });
    });
  }
}

module.exports = HistoryReciever
