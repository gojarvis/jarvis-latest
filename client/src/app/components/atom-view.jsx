import React from 'react';
import imm from 'immutable';
import Radium, { Style } from 'radium';
import { STYLES, COLORS } from '../styles';
import {mouseTrap} from 'react-mousetrap';
let Promise = require('promise');
let agent = require('superagent-promise')(require('superagent'), Promise);
import _ from 'lodash';
let eventTicker = [];

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
    let queriedItems = this.state.items.map( (item , index) => {
      let color = "rgba(80, 195, 210, 0.67)" ;
      let title = !_.isUndefined(item.endNode.title) ? item.endNode.title : item.endNode.address;
      let nodeId = item.endNode.id;
      return (
        <div style={{ backgroundColor: color, width: "100%", padding: "20px", margin: "10px"}} onClick={() => this.handleEventTickerItemClick(nodeId)}>
           {item.relationshipType} | {title} | {item.relationshipWeight}
        </div>
      )
    })


    let eventTickerElement = this.state.eventTicker.map( (item, index) => {
      let color = "rgba(80, 195, 210, 0.67)" ;

      if (index === 0) {
        color = "green"
      }
      else{
        let opacity = (100 - index * 9.90) / 100;
        color = "rgba(80, 195, 210, " + opacity + ")" ;
      }

      return (
        <div  onClick={() => this.handleEventTickerItemClick(item.data.nodeId)} style={{width: "5vw", backgroundColor: color, padding: "13px", margin: "10px", marginBottom: "15px", display: "inline-block",}}>
          <div target="{item.address}">{item.source}</div>
          <div style={{fontSize: "8px"}} nodeId={item.data.nodeId}>{item.data.nodeId}</div>
        </div>
      )
    })
    return(
      <div style={{width: "100%"}}>

        <div style={{ fontFamily: "arial", height: "100vh", backgroundColor: "rgb(40, 44, 52)", paddingTop: "10px"}}>
          <div style={{padding: "10px", marginTop: "20px", height: "70px", overflowY: "hidden", overflowX: "scroll"}}>
            {eventTickerElement}
          </div>
          <div>
            {queriedItems}
          </div>
        </div>

      </div>
    )
  }
}

export default mouseTrap(Radium(AtomView));
