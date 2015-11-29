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

const AppBar = require('material-ui/lib/app-bar')
const Table = require('./table.jsx'); // Our custom react component
const ENTER_KEY = 13;
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
    };
  },

  getChildContext() {
    return {
      muiTheme: this.state.muiTheme,
    };
  },

  componentWillMount() {
    let newMuiTheme = ThemeManager.modifyRawThemePalette(this.state.muiTheme, {
      accent1Color: Colors.deepOrange500,
    });

    this.setState({muiTheme: newMuiTheme});
  },
  componentDidMount(){
    this.setState({socket: window.socket})
  },

  resultHandler(result){
    this.setState({result: result})
    console.log(result);

    if (result && result.outcomes && result.outcomes.length > 0){
      let best = result.outcomes[0];
      this.setState({intent: best.intent});
      if (best.entities){
        this.setState({entities: best.entities});
        console.log(best.entities)
      }
    }
  },

  clickHandler() {
    let socket = this.state.socket;
    let self = this;
    socket.on('result', function(result){
      self.resultHandler(result)
    });
    socket.on('recording', function(){
      self.setState({status: "Recording"})
    });
    socket.on('stopped', function(){
      self.setState({status: "Stopped"})
    });

    socket.emit('record');

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
      console.log(this.state.command);
      socket.emit('text', this.state.command);
      this.setState({command: ""});
		}


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

    if (this.state.entities && this.state.entities.length > 0){
      this.state.entities.forEach(function(entity){
        console.log(entity);
      })
    }



    return (
      <div style={containerStyle}>
        <AppBar
          title="Example Application"
        />
        <Paper>
          <div>
            <TextField
              hintText="Type some words"
              value={this.state.command}
              onKeyDown={this.handleKeyDown}
              onChange={this.handleChange}
              />
          </div>
          <div>{this.state.intent}</div>
          <div>{this.state.status}</div>
          <div>{entities}</div>
          <RaisedButton style={{margin: "10px"}} primary={true} label="Talk" onClick={this.clickHandler} />
          <RaisedButton style={{margin: "10px"}} primary={false} label="Stop" onClick={this.stopHandler} />

        </Paper>

      </div>
    );
  },

  _handleTouchTap() {
    this.refs.superSecretPasswordDialog.show();
  },

});

module.exports = Main;
