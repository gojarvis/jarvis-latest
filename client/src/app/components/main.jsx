const React = require('react');
const RaisedButton = require('material-ui/lib/raised-button');
const Paper = require('material-ui/lib/paper');
const Dialog = require('material-ui/lib/dialog');
const ThemeManager = require('material-ui/lib/styles/theme-manager');
const LightRawTheme = require('material-ui/lib/styles/raw-themes/light-raw-theme');
const Colors = require('material-ui/lib/styles/colors');
const Mic = require('./mic.jsx');
const FlatButton = require('material-ui/lib/flat-button');
const TextField = require('material-ui/lib/text-field');

const Card = require('material-ui/lib/card');

const AppBar = require('material-ui/lib/app-bar')
const Table = require('./table.jsx'); // Our custom react component
const ENTER_KEY = 13;
const Face = require('./face.jsx'); // Our custom react component
const Feedback = require('./feedback.jsx');

const greetingResponses = require('../conversations/greetings');
const queryIdentityResponses = require('../conversations/queryIdentity');
const queryPurposeResponses = require('../conversations/queryPurpose');
const queryTimeResponses = require('../conversations/queryTime');
const queryStatusResponses = require('../conversations/queryStatus');
const queryOriginResponses = require('../conversations/queryOrigin');
const hints = require('../conversations/hints');
const feelSorry = require('../conversations/feelSorry');
const heckle = require('../conversations/heckle');

import {mouseTrap} from 'react-mousetrap';

const Main = React.createClass({

  childContextTypes: {
    muiTheme: React.PropTypes.object,
  },

  getInitialState () {
    return {
      muiTheme: ThemeManager.getMuiTheme(LightRawTheme),
      socket: {},
      status: "...",
      command: "",
      intent: "",
      entities: {},
      input: "",
      message: "",
      hint: "Waiting for input.",
      voices: [],
      actionResult: "",
      witresult: {},
      netResult: '',
      convResult: '',
      recording: false,
      topic: '',
      related: [],
      relatedFiles: [],
      heart: '<#',
      heartValue: 0
    };
  },

  getChildContext() {
    return {
      muiTheme: this.state.muiTheme,
    };
  },
  componentWillMount() {
    let newMuiTheme = ThemeManager.modifyRawThemePalette(this.state.muiTheme, {
      accent1Color: Colors.grey800,
      primary1Color: Colors.grey800
    });

    this.setState({muiTheme: newMuiTheme});

    window.speechSynthesis.onvoiceschanged = function() {
      let voices = window.speechSynthesis.getVoices();
      this.setState({voices: voices});
    }.bind(this);

    this.props.bindShortcut('space space', this.stopRecording);
    this.props.bindShortcut('enter enter', this.startRecording);

  },
  componentDidMount(){
    let socket = window.socket;
    this.attachEvents(socket);
    this.setState({socket: socket})
  },
  resultHandler(result){
    this.setState({result: result})
    console.log(result);

    if (result && result.outcomes && result.outcomes.length > 0){
      let bestInputGuess = result.outcomes[0];
      // this.respond(bestInputGuess)
      this.setState({intent: bestInputGuess.intent});
      this.setState({witresult: result});

      this.state.socket.emit('ask', bestInputGuess.intent);

      if (this.state.topic){
        console.log("topic is set, sending to conv");
        this.state.socket.emit('conv', {intent: bestInputGuess.intent, topic: this.state.topic});
      }
    }
  },
  respond(incoming){
    //Figure out what was said, and respond
    switch(incoming.intent) {
      case 'greetings':
        this.say(greetingResponses.getResponse(incoming))
      break;
      case 'query_identity':
        this.say(queryIdentityResponses.getResponse(incoming))
      break;
      case 'query_purpose':
        this.say(queryPurposeResponses.getResponse(incoming))
      break;
      case 'query_features':
        this.say(queryPurposeResponses.getAllFeatures(incoming).join("."))
      break;
      case 'query_time':
        this.say(queryTimeResponses.getResponse(incoming))
      break;
      case 'query_status':
        this.say(queryStatusResponses.getResponse(incoming))
      break;
      case 'query_origin':
        this.say(queryOriginResponses.getResponse(incoming))
      break;
      case 'hate':
        this.say(feelSorry.getResponse(incoming))
      break;
      case 'insult':
        this.say(heckle.getResponse(incoming))
      break;
      case 'UNKNOWN':
        this.say("I don't know how to respond to that. Yet...")
      break;
    }

    this.hint(hints.getHint(incoming));
  },
  wait: function(delay, func) {
    return setTimeout(func, delay);
  },
  say(text){

    let msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'en-US';
    msg.pitch = 0.6;
    msg.rate = 0.9;

    let voices = this.state.voices;
    msg.voice = voices.filter(function(voice) { return voice.name === 'Google UK English Male'; })[0];
    window.speechSynthesis.speak(msg);
    this.setState({message: text});
  },
  hint(text){
    this.setState({hint: text})
  },
  clickHandler() {
    socket.emit('record');
  },
  handleHeartbeat(hb){
    if (hb.heartbeat % 2 === 0){
      this.setState({heart: "<3"})
    }
    else{
      this.setState({heart: "<|"})
    }

    let newHeartValue = this.state.heartValue + 1;
    this.setState({heartValue: newHeartValue})
  },
  attachEvents(socket){
    let self = this;
    socket.on('result', function(result){
      self.resultHandler(result)
    });
    socket.on('action-result', function(result){
      self.actionResultHandler(result)
    });
    socket.on('net-result', function(result){
      self.netResultHandler(result)
    });

    socket.on('conv-result', function(result){
      self.convResultHandler(result)
    });
    socket.on('recording', function(){
      self.setState({status: "Recording"})
    });
    socket.on('stopped', function(){
      self.setState({status: "Stopped"})
    });

    socket.on('speak', function(text){
      self.say(text)
    });

    socket.on('related', function(related){
      self.handleRelated(related);
    });

    socket.on('related-files', function(related){
      self.handleRelatedFiles(related);
    });

    socket.on('log', function(msg){
      console.log(msg);
    });

    socket.emit('exec', 'yeoman')

    socket.on('exec-done', function(res){
      console.log(res);
    });

    socket.on('heartbeat', function(hb){
      self.handleHeartbeat(hb)
    });
  },
  stopHandler(){
    let socket = this.state.socket;
    let self = this;

    socket.emit('stop');
  },
  handleChange(event){
    this.setState({command: event.target.value})

  },
  handleKeyDown(event){
    if (event.keyCode === ENTER_KEY) {
      event.preventDefault();
      this.state.socket.emit('text', {text: this.state.command, topic: this.state.topic});
      this.setState({command: ""});
		}
  },
  handleChangeIn(event){
    this.setState({input: event.target.value})

  },
  handleKeyDownIn(event){
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
  },
  handleChangeTopic(event){
    this.setState({topic: event.target.value})

  },
  handleKeyDownTopic(event){
    if (event.keyCode === ENTER_KEY) {
      event.preventDefault();
      this.state.socket.emit('teach', {witresult: this.state.witresult, response: this.state.input, intent: this.state.intent});
      this.setState({topic: "", });
		}
  },
  handleRelated(related){
    console.log('related',related);
    this.setState({related: related});
  },
  handleRelatedFiles(relatedFiles){
    console.log('relatedFiles',relatedFiles);
    this.setState({relatedFiles: relatedFiles});
  },
  actionResultHandler(result){
    this.setState({actionResult: result});
  },
  netResultHandler(result){
    console.log(result);
    let rnd = Math.floor(Math.random() * result.length);
    let pick = result[rnd];
    this.say(pick);
    this.setState({netResult: pick});
  },
  convResultHandler(result){
    console.log("Got result from CONV", result);
    let rnd = Math.floor(Math.random() * result.length);
    let pick = result[rnd];
    // this.say(pick);
    this.setState({convResult: pick});
  },
  startRecording(){
    this.setState({recording: true});
    socket.emit('record');
  },
  stopRecording(){
    this.setState({recording: false});
    socket.emit('stop');
    console.log('stop');
  },






  render() {
    let containerStyle = {
      margin: '0px',
      paddingTop: '0px',
    };
    let standardActions = [
      { text: 'Okay' },
    ];
    let entities = <div></div>;

    let urlStyle = {
      background: "#39E0F1",
      padding: "10px",
      borderRadius: "7px",
      margin: "10px"
    }

    let fileStyle = {
      background: "#00E601",
      padding: "10px",
      borderRadius: "7px",
      margin: "10px"
    }

    return (
      <div style={containerStyle}>

        <div style={{ height: "300px", opacity: "0.2", display: "none"}}>
          <div style={{margin: "10px", textAlign: "center", fontSize: "15px"}}>
            <div>{ this.state.related.map(item => { if (item.url) return (<div style={urlStyle}>{item.url}</div>) }) }</div>

          </div>
          <div style={{margin: "10px", textAlign: "center", fontSize: "15px"}}>
            <div>{ this.state.relatedFiles.map(item => { return (<div style={fileStyle}>{item.uri}</div>) }) }</div>
          </div>
        </div>
        <Feedback type="svg" tick={this.state.heartValue} items={this.state.related}/>
        <Feedback type="svg" tick={this.state.heartValue} items={this.state.relatedFiles} />

        <div style={{position: "absolute", bottom: "50px", margin:"0 auto", width: "100%"}}>
          <Face recording={this.state.recording}>


          </Face>
        </div>
        <div style={{display: "none"}}>
          <TextField
            style={{margin: "10px", textAlign: "center", width: "90%"}}
            hintText={this.state.hint}
            value={this.state.command}
            onKeyDown={this.handleKeyDown}
            onChange={this.handleChange}
            />
          <div style={{margin: "10px", textAlign: "center", fontSize: "12px"}}>{this.state.intent}</div>
          <div style={{margin: "10px", textAlign: "center", fontSize: "12px"}}>{this.state.topic}</div>
          <div style={{margin: "10px", textAlign: "center", fontSize: "20px"}}>{this.state.message}</div>
          <div style={{margin: "10px", textAlign: "center", fontSize: "12px"}}>{this.state.actionResult}</div>
          <div style={{margin: "10px", textAlign: "center", fontSize: "20px", display: "none"}}>{this.state.netResult}</div>
          <div style={{margin: "10px", textAlign: "center", fontSize: "15px"}}>{this.state.convResult}</div>

          <TextField
            style={{margin: "10px", textAlign: "center", width: "90%"}}
            hintText="Teach me a response"
            value={this.state.input}
            onKeyDown={this.handleKeyDownIn}
            onChange={this.handleChangeIn}
            />

            <TextField
              style={{margin: "10px", textAlign: "center", width: "90%"}}
              hintText="What are we talking about?"
              value={this.state.topic}
              onKeyDown={this.handleKeyDownIn}
              onChange={this.handleChangeTopic}
              />
        </div>


      </div>
    );
  },

  _handleTouchTap() {
    this.refs.superSecretPasswordDialog.show();
  },

});

module.exports = mouseTrap(Main);
