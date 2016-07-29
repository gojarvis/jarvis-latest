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
import QueriedItem from './QueriedItem.jsx';
import FB from 'styles/flexbox';
import COMMON from 'styles/common';
import IconText from './IconText';

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

    let focusedItem = <div>Loading...</div>;
    if (this.state.items.length) {
      let focusedNode = this.state.items[0].startNode;
      let iconClass;
      switch(focusedNode.type) {
        case 'file':
          iconClass = 'file-code-o';
          break;
        case 'url':
          iconClass = 'bookmark-o';
          break;
      }

      let filters = ['All', 'Files', 'URLs'];

      focusedItem = (
        <div style={LOCAL_STYLES.focusedItem}>
          <IconText icon={iconClass}>
            {focusedNode.title}
          </IconText>

          <IconText icon='external-link'>
            {(() => {
              if (focusedNode.type === 'url') {
                return (
                  <a style={{color: '#fff'}} target="_blank" href={focusedNode.address}>{focusedNode.address}</a>
                )
              } else {
                return <span>{focusedNode.address}</span>
              }
            })()}
          </IconText>

          <div style={LOCAL_STYLES.filterButtons}>
            {filters.map((filter, index) => {
              return (
                <div
                  key={index}
                  style={LOCAL_STYLES.filterButton}>
                  {filter}
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    return(
      <div style={{width: "100%"}}>

        <div style={LOCAL_STYLES.container}>
          <EventTickerList
            items={this.state.eventTicker}
            itemOnClick={this.handleEventTickerItemClick.bind(this)}
            style={LOCAL_STYLES.eventTickerList}
            itemStyle={LOCAL_STYLES.eventTickerItem} />

          <div>
            {focusedItem}
            <hr />
            {queriedItems}
          </div>
        </div>

      </div>
    )
  }
}

const LOCAL_STYLES = {
  container: { fontFamily: "arial", minHeight: "100vh", backgroundColor: "rgb(40, 44, 52)", },
  eventTickerList: { ...FB.base, ...FB.justify.start, minHeight: "100px", overflowY: "hidden", overflowX: "scroll", },
  __oldEventTickerItem: {width: "5vw", padding: "13px", margin: "10px", marginBottom: "15px", display: "inline-block",},
  eventTickerItem: { minWidth: 100, background: '#000', color: '#fff', padding: 10, margin: 10, display: "inline-block",},
  queriedItemsList: { padding: "20px", margin: "10px"},
  queriedItem: {},
  focusedItem: {
    color: '#fff',
  },
  filterButton: {
    ...FB.base,
    ...FB.justify.center,
    ...FB.flex.equal,
  },
  filterButtons: {
    ...FB.base,
    ...FB.justify.between,
  },
};

export default mouseTrap(Radium(AtomView));
