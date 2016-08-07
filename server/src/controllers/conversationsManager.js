// import StateMachine from 'fsm-as-promised'
// import machine from 'machina'
import HistoryGoal from '../goals/history'
import GreetingGoal from '../goals/greeting'
import KnowledgeGoal from '../goals/knowledge'
import SimilarActivityGoal from '../goals/similarActivity'
import events from 'events'
import imm, {Map, List} from 'immutable'
import Goal from '../goals/goal'

let i = 0;

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


    this.onGoalDone = this.onGoalDone.bind(this);

    this.registerEvents();

  }

  registerEvents() {
    this.socket.on('user-intent', (message) => {
      this.onIntent(message);
      // this.socket.emit('net-result', this.ask(intent));
    });
  }

  onIntent(message) {
    let parsedIntent = this.parseWitResult(message.witResult);
    let intent = parsedIntent.get('intent');
    let objectives = goals.get(intent);
    let goal = new Goal();
    goal.execute(this.onGoalDone,objectives,parsedIntent)
  }

  onGoalDone(results){
    console.log('---------------Goal done back in covo--------->');
    console.log(results);
    this.socket.emit('question-result', results);
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



}

// export default ConversationManager
module.exports = ConversationManager
