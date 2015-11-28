const React = require('react');
const RaisedButton = require('material-ui/lib/raised-button');
const Paper = require('material-ui/lib/paper');
const Dialog = require('material-ui/lib/dialog');
const ThemeManager = require('material-ui/lib/styles/theme-manager');
const LightRawTheme = require('material-ui/lib/styles/raw-themes/light-raw-theme');
const Colors = require('material-ui/lib/styles/colors');
const Mic = require('./mic.jsx');
const FlatButton = require('material-ui/lib/flat-button');


const AppBar = require('material-ui/lib/app-bar')
const Table = require('./table.jsx'); // Our custom react component
const Main = React.createClass({

  childContextTypes: {
    muiTheme: React.PropTypes.object,
  },

  getInitialState () {
    return {
      muiTheme: ThemeManager.getMuiTheme(LightRawTheme),
      socket: {},
      result: {},
      status: "...",
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

  render() {

    let containerStyle = {
      margin: '0px',
      paddingTop: '0px',
    };

    let standardActions = [
      { text: 'Okay' },
    ];

    return (
      <div style={containerStyle}>
        <AppBar
          title="Example Application"
        />
      <Paper style={{padding: "10px", margin: "10px"}}>
        <RaisedButton style={{margin: "10px"}} primary={true} label="Talk" onClick={this.clickHandler} />
        <RaisedButton style={{margin: "10px"}} primary={false} label="Stop" onClick={this.stopHandler} />
        <div style={{padding: "10px"}}>{this.state.status}</div>
        <div style={{padding: "10px"}}><pre>{this.state.result}</pre></div>
      </Paper>

      </div>
    );
  },

  _handleTouchTap() {
    this.refs.superSecretPasswordDialog.show();
  },

});

module.exports = Main;
