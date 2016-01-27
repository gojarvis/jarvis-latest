// import StateMachine from 'fsm-as-promised'
// import machine from 'machina'
import HistoryGoal from '../goals/history'
import GreetingGoal from '../goals/greeting'
import KnowledgeGoal from '../goals/knowledge'
import SimilarActivityGoal from '../goals/similarActivity'
import events from 'events'
import imm, {Map, List} from 'immutable'



let goals = Map({
  'query_history': HistoryGoal,
  'greetings': GreetingGoal
  // 'query_knowledge': new KnowledgeGoal(),
  // 'query_similar_activity': new SimilarActivityGoal()
})

class ConversationManager {
  constructor(socket, sid, io, context, history, deep) {
    this.socket = socket;
    // this.emitter = new events.EventEmitter();

    this.state = Map({
      topic: 'neutral',
      outboundQuestion: '',
      inboundResponse: '',
      currentGoal: '',
      objectives: Map(),
      parameters: Map()
    });

    this.registerEvents();

  }

  registerEvents() {
    this.socket.on('ask-response', this.handleAskResponse)

    this.socket.on('user-intent', (message) => {
      this.onIntent(message);
      // this.socket.emit('net-result', this.ask(intent));
    });
  }

  onIntent(message) {
    let userIntent = this.parseWitResult(message.witResult);
    let intent = userIntent.get('intent');
    let goalObj = goals.get(intent);
    let goal = new goalObj();
    // this.state.update('currentGoal', goal)
  }

  parseWitResult(result) {
    // console.log('parseWitResult:', JSON.stringify(result, null, 2));
    let res = imm.fromJS(result);
    let parsedOutcomes = res.get('outcomes').map(item => {
      return Map({confidence: item.get('confidence'), intent: item.get('intent'), entities: item.get('entities')});
    });

    console.log('parsedOutcomes:', JSON.stringify(parsedOutcomes.toJS(), null, 2));

    return parsedOutcomes.first();
    // if (result && result.outcomes && result.outcomes.length > 0) {
    //   let bestInputGuess = result.outcomes[0];
    //   // this.respond(bestInputGuess)
    //   // return intent
    // }
  }

  resolveGoal(intent) {
    let goal = goals.get(intent);
    return goal;
  }

  askUserForParameter(parameter, goalName) {
    this.state.update('outboundQuestion', parameter);
    this.socket.emit('ask-parameter', {
      parameter: parameter,
      goalName: goalName
    })
  }

  handleAskResponse(message) {
    let {resolvedParameter, goalName} = message;
    let goal = goals.get(goalName);
    goal.handleParameterFetched(resolvedParameter);

    // if (!_.isUndefined(this[cb])){
    //
    // }
    // else{
    //   console.log('error, could not resolved callback');
    // }
    //
  }

  //
  // saveObjective(objective){
  //   try{
  //     let obj = new Objective({
  //       created: new Date(),
  //     })
  //     return obj.save()
  //   }
  //   catch(e){
  //     // console.error('History Manager: error saving history event', e);
  //   }
  // }

  // import Thinky from 'thinky'
  //
  // let db = Thinky();
  // let type = db.type;
  //
  // let Objective = db.createModel("Objective", {
  //   id: type.string(),
  //   created: type.date(),
  //   name: type.string(),
  //   parameters: [
  //     {
  //
  //     }
  //   ]
  // })
  //
  // let Parameters = db.createModel("Parameter", {
  //
  // });

}

// export default ConversationManager
module.exports = ConversationManager
