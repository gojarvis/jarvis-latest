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
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import UserList from 'components/UserList';
import FlipMove from 'react-flip-move';
import Login from 'components/login';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Link } from 'react-router';

import Navbar from './navbar.jsx'

require('./QueriedItems.css');


class AtomView extends React.Component {
  constructor(){
    super();
    this.socket = window.socket;
    this.state = {
      eventTicker: [],
      items: [],
      filters: [
        { key: "", selected: true, label: "All" },
        { key: "files", selected: false, label: "Files" },
        { key: "urls", selected: false, label: "URLs" },
        { key: "keywords", selected: false, label: "Keywords" },
      ],
      users: [

      ],
      params: {
        nodeId: -1,
        endNodeType: false,
        endUserNodeIds: false
      }
    }


  }

  async componentWillMount() {
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
    agent.post('http://localhost:3000/api/user/teams/members').then((res) => {
        let user = [{id: userId, username: username}];
        let result = res.body;
        this.setState({
            users : _.union(user, result)
        })
    })

    agent.post('http://localhost:3000/api/user/teams').then((res) => {

        let result = res.body;
        this.setState({
            teams : result
        })
    })
    // let userNode  =

  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState) {

  }



  async handleEventTickerItemClick(nodeId){
    let result = await agent.post('http://localhost:3000/query', {nodeId:nodeId});
    setTimeout( () => {
      this.setState({
        items: []
      }, () => {
        this.setState({
          items: result.body
        });
      });
    }, 200)
  }

  async handleFilter(clickedFilter){
    let nodeId = this.state.items[0].startNode.id;
    let newParams = this.state.params;
    newParams.nodeId = nodeId;
    newParams.endNodeType = false;

    let oldFilters = this.state.filters;
    // let selectedFilter = this.state.filters.filter((filter) => filter.key = clickedFilter.key);
    let newFilters = this.state.filters.map((filter) => {
      if (filter.key === clickedFilter.key) {
        filter.selected = !filter.selected;
        if (filter.selected){
          switch (filter.key){
            case 'files':
              newParams.endNodeType = 'File';
              break;
            case 'urls':
              newParams.endNodeType =  'Url'
              break;
            case 'keywords':
              newParams.endNodeType =  'Keyword'
              break;
          }
        }
      }
      else{
        filter.selected = false
      }
      return filter
    })

    this.setState({
      filters: newFilters,
      params: newParams
    });


    this.query(newParams);

  }

  async query(params){
    console.log('PARAMS', params);
    let result = await agent.post('http://localhost:3000/query', params);
    console.log('RESULT', result.body);
    this.setState({
      items: []
    }, () => {
      this.setState({
        items: result.body
      });
    });
  }

  async handleUserFilter(selectedUser) {
    console.log(selectedUser, this.state.users);
    let newUserFilters = this.state.users.map((user) => {
      if (user.username === selectedUser.username){
        user.selected = !user.selected;
      }
      return user;
    })

    let userIds = [];
    _.forEach(newUserFilters, (item)=>{
      if (item.selected) userIds.push(item.id)
    })

    // let userIds = newUserFilters.map((item) => {if (item.selected ) { return item.id } });

    if (userIds.length === 0) userIds = false;
    let newParams = this.state.params;
    newParams.endUserNodeIds = userIds;
    this.setState({
      params: newParams
    })
    this.query(newParams);

  }

  isLoggedIn(){
    let userId = this.getParameterByName('userId', location);
    let username = this.getParameterByName('username', location);
    if (!_.isUndefined(userId)){
      localStorage.userId = userId;
      localStorage.username = username;
    }

    console.log('HEY', !_.isUndefined(localStorage.userId)  && !_.isNull(localStorage.userId));
    return !_.isUndefined(localStorage.userId)  && !_.isNull(localStorage.userId) && localStorage.userId !== 'null'
  }

  logOut() {
    localStorage.userId = null;
    window.location.href = '/';
  }

  getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
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
                return <span style={{cursor: 'pointer'}} onClick={() => this.externalLinkClick(focusedNode.address, focusedNode.type)}>{focusedNode.address}</span>
              })()}
            </IconText>
          </div>
        </Card>
      )
    }
    let filters = ['All', 'Files', 'URLs'];
    let users = [{username: 'parties', id: 83408}, {username: 'roieki', id: 83258}];
    let body;

    body = <div>
      <EventTickerList
        items={this.state.eventTicker}
        itemOnClick={this.handleEventTickerItemClick.bind(this)}
        itemStyle={LOCAL_STYLES.eventTickerItem} />

      <div>
        {focusedItem}
        <hr />
        <div style={LOCAL_STYLES.filterButtons}>
          {this.state.filters.map((filter, index) => {
            let zIndex = 5, selected;
            if (filter.selected) {
              zIndex = 0

            }
            return (
              <RaisedButton
                key={index}
                label={filter.label}
                primary={filter.selected}
                secondary={!filter.selected}
                zIndex={zIndex}
                onClick={()=>this.handleFilter(filter)}
                style={{flex: '1 1 auto', margin: 10}} />
            )
          })}
        </div>
        <UserList users={this.state.users} onClick={this.handleUserFilter.bind(this) } />
        <hr />
        <FlipMove>
          {queriedItems}
        </FlipMove>
      </div>
      <div style={{...FB.base, ...FB.justify.center, ...FB.align.center, width: '100vw', position: 'fixed', bottom: '15px'}}>
        <div style={{background: '#fff', borderRadius: 2}}>
          <Navbar />
          <Link to={`/teams`}>Teams</Link>
          <FlatButton
            style={{cursor: 'pointer', padding: '0px 20px', }}
            onClick={this.logOut}>
            <i className="fa fa-sign-out" aria-hidden="true"></i>
            <span style={{padding: 5}}>Logout!</span>
          </FlatButton>
        </div>
      </div>
    </div>

    return(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <div style={{width: "100%"}}>
          <div style={LOCAL_STYLES.container}>
            {body}
          </div>

        </div>
      </MuiThemeProvider>
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
    overflow: 'auto',
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
