import React from 'react';
import imm from 'immutable';
import Radium, { Style } from 'radium';
import { STYLES, COLORS } from '../styles';
import {mouseTrap} from 'react-mousetrap';
let Promise = require('promise');
let agent = require('superagent-promise')(require('superagent'), Promise);
import _ from 'lodash';
let eventTicker = [];
import {EventTickerList} from './EventTicker';
import QueriedItem from './QueriedItem.jsx'

class AtomView extends React.Component {
  constructor(){
    super();

    this.socket = window.socket;
    this.state = {
      eventTicker: [],
      items: []
    }

  }

  componentWillMount() {
    let self = this;
    this.socket.on('system-event', msg => {
      console.log('STATE', self.state);
      let eventTicker = self.state.eventTicker;
      if (eventTicker.length > 5) eventTicker.pop();
      eventTicker.unshift(msg);

      self.setState({
        eventTicker: eventTicker
      })
    })

  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState) {

  }

  async handleEventTickerItemClick(nodeId){
    console.log('HEllo', nodeId);
    let result = await agent.post('http://localhost:3000/query', {nodeId:nodeId});

    this.setState({
      items: result.body
    })
  }

  render(){
    console.log('Items' , this.state.items);
    let queriedItems = this.state.items.map((item , index) => {
      return (
        <QueriedItem
          item={item} key={index}
          onClick={this.handleEventTickerItemClick.bind(this)} />
      )
    })

    return(
      <div style={{width: "100%"}}>

        <div style={LOCAL_STYLES.container}>
          <EventTickerList
            items={this.state.eventTicker}
            itemOnClick={this.handleEventTickerItemClick.bind(this)}
            style={LOCAL_STYLES.eventTickerList}
            itemStyle={LOCAL_STYLES.eventTickerItem} />

          <div>
            {queriedItems}
          </div>
        </div>

      </div>
    )
  }
}

const FB = {
  base: { display: "flex" },
  direction: {
    row: { flexDirection: "row" },
    column: { flexDirection: "column" }
  },
  justify: {
    start: { justifyContent: "flex-start" },
    end: { justifyContent: "flex-end" },
    center: { justifyContent: "center" },
    between: { justifyContent: "space-between" },
    around: { justifyContent: "space-around" },
  }
}

const LOCAL_STYLES = {
  container: { fontFamily: "arial", height: "100vh", backgroundColor: "rgb(40, 44, 52)", },
  eventTickerList: { ...FB.base, ...FB.justify.start, minHeight: "100px", overflowY: "hidden", overflowX: "scroll", },
  __oldEventTickerItem: {width: "5vw", padding: "13px", margin: "10px", marginBottom: "15px", display: "inline-block",},
  eventTickerItem: { minWidth: 100, background: '#000', color: '#fff', padding: 10, margin: 10, display: "inline-block",},
  queriedItemsList: { padding: "20px", margin: "10px"},
  queriedItem: {},
};

export default mouseTrap(Radium(AtomView));
