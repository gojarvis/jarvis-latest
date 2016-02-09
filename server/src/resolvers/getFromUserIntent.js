import EventEmitter from 'events';
import Immutable from 'immutable';

let socket = GLOBAL._socket;

class getFromUserIntent {
  constructor() {

  }

  async execute(message){
    let result = await this.get(message)
    console.log('Resolver result', result);
    return result
  }

  get(message) {
    return new Promise(function(resolve, reject) {
      try {

        let {objective, target, params, intent}  = message;

        params = Immutable.fromJS(params)
        intent = Immutable.fromJS(intent)

        let path = params.get('path');
        //Extract the value from the intent
        let value = intent.getIn(path);

        // when done
        let res = { objective: objective, results: value, resolverName: 'getFromUserIntent', target: target};
        setTimeout(()=>{
          resolve(res);
        },5000)
      } catch (e) {
        console.log('ERROR', e);
      } finally {

      }
    });
  }


}

module.exports = getFromUserIntent;
