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
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/lib/card';
import RaisedButton from 'material-ui/lib/raised-button';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import UserList from 'components/UserList';
require('./QueriedItems.css');


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
      // console.log('STATE', self.state);
      let eventTicker = self.state.eventTicker;
      // if (eventTicker.length > 5) eventTicker.pop();
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
    let result = await agent.post('http://localhost:3000/query', {nodeId:nodeId});
    setTimeout( () => {
      this.setState({
        items: result.body
      })
    }, 200)
  }

  async handleFilter(eventType){
    let nodeId = this.state.items[0].startNode.id;
    let params = {nodeId};
    let type;
    switch (eventType){
      case 'Files':
        type = 'File';
        params.endNodeType = 'File';
        break;
      case 'URLs':
        params.endNodeType =  'Url'
        break;
      case 'Keywords':
        params.endNodeType =  'Keyword'
        break;
    }
    let result = await agent.post('http://localhost:3000/query', params);

    this.setState({
      items: result.body
    })
  }

  async handleUserFilter(user) {
    let nodeId = this.state.items[0].startNode.id;
    let params = {
      nodeId: nodeId,
      endUserNodeIds: [user.id],
      users: [user.id],
    };
    let result = await agent.post('http://localhost:3000/query', params);
    console.log('RESULT', result.body);
    this.setState({
      items: result.body
    });
  }

  async externalLinkClick(address, type){

    let params = {
      address : address,
      type: type
    };
    let result = await agent.post('http://localhost:3000/open', params);
  }

  render(){
    // console.log('Items' , this.state.items);
    let queriedItems = this.state.items.map((item , index) => {
      return (
        <QueriedItem
          item={item} key={index}
          onClick={this.handleEventTickerItemClick.bind(this)} />
      )
    })

    let focusedItem = <div />;
    if (this.state.items.length) {
      let focusedNode = this.state.items[0].startNode;
      let iconClass, iconColor;
      switch(focusedNode.type) {
        case 'file':
          iconClass = 'file';
          iconColor = '#FF3F81';
          break;
        case 'url':
          iconClass = 'bookmark';
          iconColor = '#00BBD5';
          break;
      }

      focusedItem = (
        <Card style={LOCAL_STYLES.focusedItem} zDepth={5}>
          <div>
            <IconText icon={iconClass} iconColor={iconColor}>
              {(focusedNode.title || focusedNode.address).split('/').filter(item => item !== '').slice(-1).pop()}
            </IconText>

            <IconText icon='external-link'>
              {(() => {
                return <span onClick={() => this.externalLinkClick(focusedNode.address, focusedNode.type)}>{focusedNode.address}</span>
              })()}
            </IconText>
          </div>
        </Card>
      )
    }
    let filters = ['All', 'Files', 'URLs', 'Keywords'];
    let users = [{username: 'parties', id: 83408}, {username: 'roieki', id: 83258}];

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
            <div style={LOCAL_STYLES.filterButtons}>
              {filters.map((filter, index) => {
                return (
                  <RaisedButton
                    key={index}
                    label={filter}
                    primary={index === 1}
                    secondary={index === 2}
                    onClick={()=>this.handleFilter(filter)}
                    style={{flex: '1 1 auto', margin: 10}} />
                )
              })}
            </div>
            <UserList users={users} onClick={this.handleUserFilter.bind(this) } />
            <hr />
              <CSSTransitionGroup
                transitionName='query-item'
                transitionEnterTimeout={2000}
                transitionLeaveTimeout={0}
                component='div'
                className='query-item-list'>
                {queriedItems}
              </CSSTransitionGroup>

          </div>
        </div>

      </div>
    )
  }
}

// TODO: pull these out to separate file
const LOCAL_STYLES = {
  container: {
    fontFamily: "arial",
    minHeight: "100vh",
    backgroundColor: "rgb(40, 44, 52)",
    color: '#fff',
  },
  eventTickerList: {
    ...FB.base,
    ...FB.justify.start,
    minHeight: 70,
    overflowY: "hidden",
    overflowX: "scroll",
  },
  __oldEventTickerItem: {
    width: "5vw",
    padding: "13px",
    margin: "10px",
    marginBottom: "15px",
    display: "inline-block",
  },
  eventTickerItem: {
    minWidth: 100,
  },
  queriedItemsList: {
    padding: "20px",
    margin: "10px"
  },
  queriedItem: {},
  focusedItem: {
    margin: "10px",
    padding: "10px",
    color: "black"
  },
  filterButton: {
    ...FB.base,
    ...FB.justify.center,
    ...FB.flex.equal,
  },
  filterButtons: {
    ...FB.base,
    ...FB.justify.around,
  },
};

export default mouseTrap(Radium(AtomView));
