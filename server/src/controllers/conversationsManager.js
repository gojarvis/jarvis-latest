import StateMachine from 'fsm-as-promised'
import machine from 'machina'
import { Map, List } from 'immutable';
import HistoryGoal from '../goals/history'
import KnowledgeGoal from '../goals/knowledge'
import SimilarActivityGoal from '../goals/similarActivity'
import events from 'events'


let goals = Map({
  'query_history': new HistoryGoal(),
  'query_knowledge': new KnowledgeGoal(),
  'query_similar_activity': new SimilarActivityGoal()
})

class ConversationManager {
  constructor(socket) {
    this.socket = socket;
    this.emitter = new events.EventEmitttr();

    this.state = Map({
      topic: 'neutral',
      outboundQuestion: '',
      inboundResponse: '',
      currentGoal: ''
      objectives: Map(),
      parameters: Map(),
    });

    this.registerEvents();

  }

  registerEvents(){
    this.socket.on('ask-response', self.handleAskResponse)
  }

  onIntent(witResult){
      let {intent, parameters, state} = self.parseWitResult(witResults);
      let goal = this.resolveGoal(intent, state);
      this.state.update('currentGoal', goal)
  }

  parseWitResult(result){
    // if (result && result.outcomes && result.outcomes.length > 0) {
    //   let bestInputGuess = result.outcomes[0];
    //   // this.respond(bestInputGuess)
    //   // return intent
    // }
  }

  resolveGoal(intent){
    let goal = goals.get(intent);
    return goal
  }




  askUserForParameter(parameter, goalName){
    let self = this;
    self.state.update('outboundQuestion', parameter);
    self.socket.emit('ask-parameter', {
      parameter: parameter,
      goalName: goalName
    })
  }

  handleAskResponse(message){
    let { resolvedParameter, goalName } = message;
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

export default ConversationManager
