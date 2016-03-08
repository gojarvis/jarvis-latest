'use strict'
import _ from 'lodash';
import historyReciever from '../recievers/history'

class IntentsManager {
  constructor(context) {
      this.recievers = {
        'query_history': new historyReciever()
      };
      this.context = context;
  }


  async handleKnownIntents(witResponse, context){
    let { intent, entities, confidence } =  witResponse;
    let { user, urls, files} = this.context.get();




    if (_.isUndefined(this.recievers[intent])){
      return this.handleUnknown();
    }
    else{
      let reciever = this.recievers[intent];
      let response = await reciever.getResponse(user, entities);
      return response;
    }

  }

  handleUnknown(){
    console.log('unknown intent');
  }

}

module.exports = IntentsManager
