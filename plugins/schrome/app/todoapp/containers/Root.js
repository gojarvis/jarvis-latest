import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import io from 'socket.io-client'
let agent = require('superagent-promise')(require('superagent'), Promise);
let socket = io.connect('http://localhost:3000', {reconnect: true});
console.log(socket);
// import io from 'socket.io-client'
export default class Root extends Component {

  static propTypes = {
    store: PropTypes.object.isRequired
  };
  constructor(){
    super()
    this.state = {
      disabled: false
    }
  }

  componentWillMount(){
    let self = this;
    socket.on('chrome-disabled',function(){
      console.log('Now disabled');
      self.setState({disabled: true})
    });
    socket.on('chrome-enabled',function(){
      console.log('Now enabled');
      self.setState({disabled: false})
    });
  }

  disable(){
    socket.emit('chrome-disable');
  }

  enable(){
    socket.emit('chrome-enable');
  }
  render() {
    const { store } = this.props;
    let disabled;
    console.log('STATE' , this.state);
    if (this.state){
       disabled = this.state.disabled ? 'disabled' : 'enabled';
    }

    return (
      <div>
        Jarvis is currently {disabled}
        <div onClick={() => this.disable()}> Disable </div>
        <div onClick={() => this.enable()}> Enable </div>
      </div>
    );
  }
}
