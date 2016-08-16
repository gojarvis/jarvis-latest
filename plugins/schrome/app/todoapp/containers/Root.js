import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import io from 'socket.io-client'
let agent = require('superagent-promise')(require('superagent'), Promise);
let socket = io.connect('http://localhost:3000', {reconnect: true});

export default class Root extends Component {

  static propTypes = {
    store: PropTypes.object.isRequired
  };

  constructor(){
    super();

    this.state = {
      isEnabled: true
    }
  }

  componentWillMount(){
    console.log('mounting...')
    let self = this;
    socket.on('chrome-disabled',function(){
      console.log('Now disabled');
      self.setState({isEnabled: true})
    });
    socket.on('chrome-enabled',function(){
      console.log('Now enabled');
      self.setState({isEnabled: false})
    });

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes.hasOwnProperty('isEnabled')) {
        this.setState({ isEnabled: changes.isEnabled.newValue });
      }
    })
  }

  componentDidMount() {
    chrome.storage.local.get('isEnabled', (obj) => {
      this.setState({ isEnabled: obj.isEnabled });
    });
  }

  enable(){
    socket.emit('chrome-enable');
    chrome.storage.local.set({ isEnabled: true });
  }

  disable(){
    socket.emit('chrome-disable');
    chrome.storage.local.set({ isEnabled: false });
  }

  render() {
    const { store } = this.props;
    let isEnabled;
    console.log('STATE' , this.state);
    if (this.state){
      isEnabled = this.state.isEnabled ? 'disabled' : 'enabled';
    }

    let color = this.state.isEnabled ? 'red' : 'green';

    return (
      <div>
        <div
          onClick={() => this.enable()}
          style={{...styles.container, color: this.state.isEnabled ? 'green' : 'black'}}>
          <span style={styles.icon}>&#x2713;</span>
          <span style={styles.text}>Enable</span>
        </div>
        <div
          onClick={() => this.disable()}
          style={{...styles.container, color: !this.state.isEnabled ? 'red' : 'black'}}>
          <span style={styles.icon}>&#x2717;</span>
          <span style={styles.text}>Disable</span>
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    padding: 10,
    cursor: 'pointer'
  },
  icon: {
    flexBasis: '20px'
  },
  text: {
    flex: '1 0 auto'
  }
}
