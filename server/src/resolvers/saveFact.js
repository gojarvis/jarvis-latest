'use strict'
import colors from 'colors';
import Thinky from 'thinky'

var db = Thinky();
var type = db.type;

var Fact = db.createModel("Fact", {
  id: type.string(),
  timestamp: type.date(),
  subject: type.string(),
  factType: type.string(),
  payload: type.string(),
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

  async save(message) {
    console.log('saveFACT', message);
    let fact = message.params.toJS();
    console.log('FACT'.green, fact);

    let savedFact = await this.rethinkSave(fact);
    this.master.emit('resolverDone', { objective: objective, results: savedFact, resolverName: this.resolverName});



  }

  rethinkSave(fact){
    console.log('SAVEING IN RETHINK', fact.payload);
    return new Promise(function(resolve, reject) {
      try{
        let fct = new Fact({timestamp: new Date(), factType: fact.type, subject: fact.subject, payload: fact.payload, source:fact.source})
        fct.save().then(function(err,res){
          console.log('Resolver saved fact');
          if (err){
            reject(err)
          }
          else{
            resolve(res)
          }

        })
      }
      catch(e){

        console.error('Fact Manager: error saving history event', e);
        reject(err)
      }
    });
  }

  gotResponseFromUser(message){
    let {text} = message;
    let objective = this.objective;

  }




}

module.exports = saveFact;
