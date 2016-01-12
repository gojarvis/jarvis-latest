import React from 'react';
import imm from 'immutable';
import Radium, { Style } from 'radium';
import { STYLES, COLORS } from '../styles';

// ui imports
import RaisedButton from 'material-ui/lib/raised-button';
import Paper from 'material-ui/lib/paper';
import Dialog from 'material-ui/lib/dialog';
import ThemeManager from 'material-ui/lib/styles/theme-manager';
import LightRawTheme from 'material-ui/lib/styles/raw-themes/light-raw-theme';
import Colors from 'material-ui/lib/styles/colors';
import FlatButton from 'material-ui/lib/flat-button';
import TextField from 'material-ui/lib/text-field';
import Card from 'material-ui/lib/card';
import AppBar from 'material-ui/lib/app-bar';

// Our custom react components
import Mic from './mic.jsx';
import Table from './table.jsx';
import Face from './face.jsx';
import Feedback from './feedback.jsx';
import CardsView from './CardsView.jsx';
const ENTER_KEY = 13;

import greetingResponses from '../conversations/greetings';
import queryIdentityResponses from '../conversations/queryIdentity';
import queryPurposeResponses from '../conversations/queryPurpose';
import queryTimeResponses from '../conversations/queryTime';
import queryStatusResponses from '../conversations/queryStatus';
import queryOriginResponses from '../conversations/queryOrigin';
import hints from '../conversations/hints';
import feelSorry from '../conversations/feelSorry';
import heckle from '../conversations/heckle';

import {mouseTrap} from 'react-mousetrap';

class Main extends React.Component {

  constructor() {
    super();

    this.state = {
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
  }

  getChildContext() {
    return {muiTheme: this.state.muiTheme};
  }

  componentWillMount() {
    let newMuiTheme = ThemeManager.modifyRawThemePalette(this.state.muiTheme, {
      accent1Color: Colors.grey800,
      primary1Color: Colors.grey800
    });

    this.setState({muiTheme: newMuiTheme});

    window.speechSynthesis.onvoiceschanged = function () {
      let voices = window.speechSynthesis.getVoices();
      this.setState({voices: voices});
    }.bind(this);

    this.props.bindShortcut('space space', this.stopRecording);
    this.props.bindShortcut('enter enter', this.startRecording);

  }

  componentDidMount() {
    let socket = window.socket;
    this.attachEvents(socket);
    this.setState({socket: socket})
  }

  resultHandler(result) {
    this.setState({result: result})
    console.log(result);

    if (result && result.outcomes && result.outcomes.length > 0) {
      let bestInputGuess = result.outcomes[0];
      // this.respond(bestInputGuess)
      this.setState({intent: bestInputGuess.intent});
      this.setState({witresult: result});

      this.state.socket.emit('ask', bestInputGuess.intent);

      if (this.state.topic) {
        console.log("topic is set, sending to conv");
        this.state.socket.emit('conv', {
          intent: bestInputGuess.intent,
          topic: this.state.topic
        });
      }
    }
  }

  respond(incoming) {
    //Figure out what was said, and respond
    switch (incoming.intent) {
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
  }

  wait(delay, func) {
    return setTimeout(func, delay);
  }

  say(text) {

    let msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'en-US';
    msg.pitch = 0.6;
    msg.rate = 0.9;

    let voices = this.state.voices;
    msg.voice = voices.filter(function (voice) {
      return voice.name === 'Google UK English Male';
    })[0];
    window.speechSynthesis.speak(msg);
    this.setState({message: text});
  }

  hint(text) {
    this.setState({hint: text})
  }

  clickHandler() {
    socket.emit('record');
  }

  handleHeartbeat(hb) {
    if (hb.heartbeat % 2 === 0) {
      this.setState({heart: "<3"})
    } else {
      this.setState({heart: "<|"})
    }

    let newHeartValue = this.state.heartValue + 1;
    this.setState({heartValue: newHeartValue})
  }

  attachEvents(socket) {
    let self = this;
    socket.on('result', function (result) {
      self.resultHandler(result)
    });
    socket.on('action-result', function (result) {
      self.actionResultHandler(result)
    });
    socket.on('net-result', function (result) {
      self.netResultHandler(result)
    });

    socket.on('conv-result', function (result) {
      self.convResultHandler(result)
    });
    socket.on('recording', function () {
      self.setState({status: "Recording"})
    });
    socket.on('stopped', function () {
      self.setState({status: "Stopped"})
    });

    socket.on('speak', function (text) {
      self.say(text)
    });

    socket.on('related', function (related) {
      self.handleRelated(related);
    });

    socket.on('recommendations', function (recommendations) {
      self.handleRecommendation(recommendations);
    })

    socket.on('related-files', function (related) {
      self.handleRelatedFiles(related);
    });

    socket.on('log', function (msg) {
      console.log(msg);
    });

    socket.emit('exec', 'yeoman')

    socket.on('exec-done', function (res) {
      console.log(res);
    });

    socket.on('heartbeat', function (hb) {
      self.handleHeartbeat(hb)
    });
  }

  stopHandler() {
    let socket = this.state.socket;
    let self = this;

    socket.emit('stop');
  }

  handleChange(event) {
    this.setState({command: event.target.value})

  }

  handleKeyDown(event) {
    if (event.keyCode === ENTER_KEY) {
      event.preventDefault();
      this.state.socket.emit('text', {
        text: this.state.command,
        topic: this.state.topic
      });
      this.setState({command: ""});
    }
  }

  handleChangeIn(event) {
    this.setState({input: event.target.value})

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

  handleChangeTopic(event) {
    this.setState({topic: event.target.value})

  }

  handleKeyDownTopic(event) {
    if (event.keyCode === ENTER_KEY) {
      event.preventDefault();
      this.state.socket.emit('teach', {
        witresult: this.state.witresult,
        response: this.state.input,
        intent: this.state.intent
      });
      this.setState({topic: ""});
    }
  }

  handleRelated(related) {
    console.log('related', related);
    this.setState({related: related});
  }

  handleRelatedFiles(relatedFiles) {
    console.log('relatedFiles', relatedFiles);
    this.setState({relatedFiles: relatedFiles});
  }

  actionResultHandler(result) {
    this.setState({actionResult: result});
  }

  handleRecommendation(recommendations) {
    console.log('Recommendations', recommendations);
    this.setState({
      historics: recommendations.historics,
      social: recommendations.social
    });
  }

  netResultHandler(result) {
    console.log(result);
    let rnd = Math.floor(Math.random() * result.length);
    let pick = result[rnd];
    this.say(pick);
    this.setState({netResult: pick});
  }

  convResultHandler(result) {
    console.log("Got result from CONV", result);
    let rnd = Math.floor(Math.random() * result.length);
    let pick = result[rnd];
    // this.say(pick);
    this.setState({convResult: pick});
  }

  startRecording() {
    this.setState({recording: true});
    socket.emit('record');
  }

  stopRecording() {
    this.setState({recording: false});
    socket.emit('stop');
    console.log('stop');
  }

  render() {
    let styles = {
      maxHeight: '100vh',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end'
    };

    return (
      <div style={styles}>
        <Style rules={STYLES.Main} />

        <div style={{flex: '1 1 auto', overflow: 'scroll'}}>
          <CardsView lists={imm.fromJS({
            urls: this.state.related,
            files: this.state.relatedFiles,
            historics: this.state.historics,
            social: this.state.social
          })} />
        </div>

        <div style={{flex: '0 0 80px', marginTop: 40}}>
          <Face recording={this.state.recording}></Face>
        </div>
      </div>
    );
  }

  _handleTouchTap() {
    this.refs.superSecretPasswordDialog.show();
  }

}

Main.childContextTypes = {
  muiTheme: React.PropTypes.object
}

export default mouseTrap(Radium(Main));
