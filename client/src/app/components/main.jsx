import React from 'react';
import imm from 'immutable';
import Radium, {Style} from 'radium';
import {STYLES, COLORS} from '../styles';
import Tabs from 'material-ui/lib/tabs/tabs';
import Tab from 'material-ui/lib/tabs/tab';
import SwipeableViews from 'react-swipeable-views';

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
import _ from 'lodash';
// Our custom react components
import Mic from './mic.jsx';
import Table from './table.jsx';
import Face from './face.jsx';
import Feedback from './feedback.jsx';
import VoiceInteraction from './voiceInteraction.jsx';
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
      recommendations: [],
      kwrelated: [],
      openwith: [],
      heart: '<#',
      heartValue: 0,
      slideIndex: 0,
      queue: []
    };

    this.handleRecommendation = this.handleRecommendation.bind(this);
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

      this.state.socket.emit('user-intent', {
        witResult: result,
        topic: this.state.topic
      });

      if (this.state.topic) {
        console.log("topic is set, sending to conv");
        this.state.socket.emit('conv', {
          intent: bestInputGuess.intent,
          topic: this.state.topic
        });
      }
    }
  }

  wait(delay, func) {
    return setTimeout(func, delay);
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

    socket.on('recording', function () {
      self.setState({status: "Recording"})
    });
    socket.on('stopped', function () {
      self.setState({status: "Stopped"})
    });

    socket.on('related', function (related) {
      // self.handleRelated(related);
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
    // console.log(recommendations.openwith);
    this.setState({
      recommendations: recommendations.social,
      related: recommendations.openwith,
      openwith: recommendations.openwith,
      kwrelated: recommendations.kwrelated,
    })
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

  handleSlideChange = (value) => {
    console.log("SLID VALUE", parseInt(value));
    this.setState({slideIndex: parseInt(value)});
  }

  render() {
    let containerStyle = {
      margin: '0px',
      paddingTop: '0px'
    };
    let standardActions = [
      {
        text: 'Okay'
      }
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
        <Style rules={STYLES.Main} />

        <div style={{
          width: '100%',
          height: '100%',
        }}>
        <Tabs onChange={this.handleSlideChange}>
          <Tab label="Open With" value="0" />
          <Tab label="Keywords" value="1" />
          <Tab label="Files" value="2" />
          <Tab label="Social" value="3" />
        </Tabs>
          <SwipeableViews
            index={this.state.slideIndex}
            style={{margin: '10px'}}
            >
            <Feedback ref="openwith" type="svg" tick={this.state.heartValue} items={this.state.openwith}/>
            <Feedback ref="kwrelated" type="svg" tick={this.state.heartValue} items={this.state.kwrelated}/>
            <Feedback ref="relatedfiles" type="svg" tick={this.state.heartValue} items={this.state.relatedFiles}/>
            <Feedback ref="recommendations" type="svg" tick={this.state.heartValue} items={this.state.recommendations}/>
          </SwipeableViews>
        </div>

        <div style={{
          position: "absolute",
          bottom: "50px",
          margin: "0 auto",
          width: "100%"
        }}>
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
