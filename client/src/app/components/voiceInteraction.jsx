import React from 'react';
import imm from 'immutable';
import Radium, {Style} from 'radium';
import {STYLES, COLORS} from '../styles';
import TextField from 'material-ui/lib/text-field';
const ENTER_KEY = 13;

class VoiceInteraction extends React.Component {
  constructor() {
    super() // duper

    this.state = {
      queue: [],
      questionIsOpen: false,
      questionTarget: '',
      talking: false,
    };

    this.attachEvents = this.attachEvents.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleChangeIn = this.handleChangeIn.bind(this);
    this.handleKeyDownIn = this.handleKeyDownIn.bind(this);
    this.say = this.say.bind(this);
  }

  componentWillMount() {
    window.speechSynthesis.onvoiceschanged = () => {
      let voices = window.speechSynthesis.getVoices();
      this.setState({voices: voices});
    }.bind(this);

    // this.props.bindShortcut('space space', this.stopRecording);
    // this.props.bindShortcut('enter enter', this.startRecording);
  }

  componentDidMount() {
    let socket = window.socket;
    this.attachEvents(socket);
    this.setState({socket: socket});
  }

  handleKeyDownIn(event) {
    if (event.keyCode === ENTER_KEY) {
      event.preventDefault();

      let lesson = {
        witresult: this.state.witresult,
        response: this.state.input,
        intent: this.state.intent,
        topic: this.state.topic
      };
      console.log('teaching', lesson);
      this.state.socket.emit('teach', lesson);

      this.setState({input: ""});
    }
  }

  say(text) {

    let msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'en-US';
    msg.pitch = 0.6;
    msg.rate = 0.9;

    let voices = this.state.voices;
    msg.voice = voices.filter((voice) => {
      return voice.name === 'Google UK English Male';
    })[0];

    msg.onend = (e) => {
      this.setState({talking: false})
    }.bind(this)

    msg.onstart = (e) => {
      this.setState({talking: true})
      this.setState({message: text});
    }.bind(this)

    let talking = this.state.talking;
    let queue = this.state.queue;

    if (!talking) {
      window.speechSynthesis.speak(msg);
      if (queue.length > 0) {
        this.popSpeachQueue();
      }
    } else {
      queue.push(text)
    }
  }

  respond(incoming) {
    //Figure out what was said, and respond
    switch (incoming.intent) {
      case 'greetings':
        this.say(greetingResponses.getResponse(incoming));
        break;
      case 'query_identity':
        this.say(queryIdentityResponses.getResponse(incoming));
        break;
      case 'query_purpose':
        this.say(queryPurposeResponses.getResponse(incoming));
        break;
      case 'query_features':
        this.say(queryPurposeResponses.getAllFeatures(incoming).join("."));
        break;
      case 'query_time':
        this.say(queryTimeResponses.getResponse(incoming));
        break;
      case 'query_status':
        this.say(queryStatusResponses.getResponse(incoming));
        break;
      case 'query_origin':
        this.say(queryOriginResponses.getResponse(incoming));
        break;
      case 'hate':
        this.say(feelSorry.getResponse(incoming));
        break;
      case 'insult':
        this.say(heckle.getResponse(incoming));
        break;
      case 'UNKNOWN':
        this.say("I don't know how to respond to that. Yet...");
        break;
    }

    this.hint(hints.getHint(incoming));
  }

  handleKeyDown(event) {
    if (event.keyCode === ENTER_KEY) {
      event.preventDefault();

      if (this.state.questionIsOpen) {
        let questionTarget = this.state.questionTarget;
        this.state.socket.emit(questionTarget, {text: this.state.command})

        this.setState({questionIsOpen: false})
      } else {
        this.state.socket.emit('text', {
          text: this.state.command,
          topic: this.state.topic
        });
      }
      this.setState({command: ""});
    }
  }

  attachEvents(socket) {
    socket.on('speak', (text) => {
      this.say(text)
    });

    socket.on('questionFromJarvis', (question) => {
      console.log('QUESTION', question);
      this.setState({questionIsOpen: true, questionTarget: question.target})

      this.say(question.text);
    });

    socket.on('ask-parameter', (message) => {
      let {parameter, goalName} = message;

      // parameter { name: 'parameter name', status: ['unresolved', 'resolved'], value: 'question text', type: ['text', 'query'] }
      let ask = {
        parameter,
        goalName
      };

      console.log('ask:', ask);
      this.setState({ask});
    });

    socket.on('conv-result', (result) => {
      this.convResultHandler(result)
    });

    socket.on('net-result', (result) => {
      this.netResultHandler(result)
    });
  }

  convResultHandler(result) {
    console.log("Got result from CONV", result);
    let rnd = Math.floor(Math.random() * result.length);
    let pick = result[rnd];
    // this.say(pick);
    this.setState({convResult: pick});
  }

  netResultHandler(result) {
    console.log(result);
    let rnd = Math.floor(Math.random() * result.length);
    let pick = result[rnd];
    this.say(pick);
    this.setState({netResult: pick});
  }

  hint(text) {
    this.setState({hint: text})
  }

  popSpeachQueue() {
    let queue = this.state.queue;
    let message = queue[0];
    this.say(message);
    let deququed = queue.shift()
    this.setState({queue: dequeued})
  }

  handleChange(event) {
    this.setState({command: event.target.value})
  }

  handleChangeIn(event) {
    this.setState({input: event.target.value});
  }

  render() {
    return (
      <div style={{
        display: "absolute",
        bottom: 50
      }}>
        <TextField style={{
          margin: "10px",
          textAlign: "center",
          width: "90%"
        }} hintText={this.state.hint} value={this.state.command} onKeyDown={this.handleKeyDown} onChange={this.handleChange}/>
        <div style={{
          margin: "10px",
          textAlign: "center",
          fontSize: "12px"
        }}>{this.state.intent}</div>
        <div style={{
          margin: "10px",
          textAlign: "center",
          fontSize: "12px"
        }}>{this.state.topic}</div>
        <div style={{
          margin: "10px",
          textAlign: "center",
          fontSize: "20px"
        }}>{this.state.message}</div>
        <div style={{
          margin: "10px",
          textAlign: "center",
          fontSize: "12px"
        }}>{this.state.actionResult}</div>
        <div style={{
          margin: "10px",
          textAlign: "center",
          fontSize: "20px",
          display: "none"
        }}>{this.state.netResult}</div>
        <div style={{
          margin: "10px",
          textAlign: "center",
          fontSize: "15px"
        }}>{this.state.convResult}</div>

        <TextField style={{
          margin: "10px",
          textAlign: "center",
          width: "90%"
        }} hintText="Teach me a response" value={this.state.input} onKeyDown={this.handleKeyDownIn} onChange={this.handleChangeIn}/>

        <TextField style={{
          margin: "10px",
          textAlign: "center",
          width: "90%"
        }} hintText="What are we talking about?" value={this.state.topic} onKeyDown={this.handleKeyDownIn} onChange={this.handleChangeTopic}/>
      </div>
    )
  }
}

export default Radium(VoiceInteraction);
