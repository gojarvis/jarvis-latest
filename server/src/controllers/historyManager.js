// var thinky = require('thinky')();
//
// var type = thinky.type;
// console.log(thinky, type);


import Thinky from 'thinky'

var db = Thinky();
var type = db.type;

var Event = db.createModel("Event", {
  id: type.string(),
  timestamp: type.date(),
  source: type.string(),
  eventType: type.string(),
  data: type.object()
})

class HistoryManager{
  constructor(){
  }

  saveEvent(event){
    let ev = new Event({timestamp: new Date(), eventType: event.type, source: event.source, data: event.data})
    return ev.save()
  }
}

module.exports = HistoryManager;
