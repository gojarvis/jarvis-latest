
import Thinky from 'thinky'

var db = Thinky();
var type = db.type;

var Fact = db.createModel("Fact", {
  id: type.string(),
  timestamp: type.date(),
  subject: type.string(),
  factType: type.string(),
  data: type.object(),
  source: type.string()
})

import EventEmitter from 'events';
let socket = GLOBAL._socket;

class saveFact {
  constructor(master) {
    this.master = master;
    this.resolverName = 'saveFact';

    this.master.on('saveFact', this.save.bind(this));

    this.save = this.save.bind(this)

  }

  save(message) {
    console.log('saveFACT', message);

    // let {fact} = objective;
    //
    // try{
    //   let fct = new Fact({timestamp: new Date(), factType: fact.type, subject: fact.subject, data: fact.data, source:fact.source})
    //   fct.save().then(function(err,res){
    //     console.log('Resolver saved fact');
    //     this.master.emit('resolverDone', { objective: objective, results: res, resolverName: this.resolverName});
    //   })
    // }
    // catch(e){
    //   console.error('History Manager: error saving history event', e);
    // }

  }

  gotResponseFromUser(message){
    let {text} = message;
    let objective = this.objective;

  }




}

module.exports = saveFact;
