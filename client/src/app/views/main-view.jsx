import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { batchActions } from 'redux-batched-actions';
import layout from 'styles/layout';
import _ from 'lodash';
let agent = require('superagent-promise')(require('superagent'), Promise);
import {EventTickerList} from 'components/EventTicker';
import QueriedItemList from 'components/QueriedItemList';
import ViewWrapper from 'views/view-wrapper';
import FocusedItem from 'components/FocusedItem';
import Navbar from 'components/navbar';
import imm from 'immutable';
import FB from 'styles/flexbox';
import RaisedButton from 'material-ui/RaisedButton';
import UserList from 'components/UserList';
import Toggle from 'material-ui/Toggle';
import * as ActionCreators from 'store/actionCreators';

class MainView extends Component {
  constructor(...args) {
    super(...args);
    this.socket = window.socket;

    this.state = {
      eventTickerItems: new imm.List(),
      users: new imm.List(),
      teams: new imm.List(),
      filters: [
        { key: "", selected: true, label: "All" },
        { key: "files", selected: false, label: "Files" },
        { key: "urls", selected: false, label: "URLs" },
        { key: "keywords", selected: false, label: "Keywords" },
      ],
      params: {
        nodeId: -1,
        endNodeType: false,
        endUserNodeIds: false
      },
      latestItem: new imm.Map(),
      autoswitch: false
    }
  }

  static get defaultProps() {
    return {
      queriedItems: imm.List()
    }
  }

  // componentDidMount() {
  //   let { dispatch } = this.props;
  // }

  async handleFilter(clickedFilter){
    let nodeId = this._focusedItem().get('id');
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

  //  params: {
  //    nodeId: neo4j node id (default: -1),
  //    endNodeType: enum['File', 'Url', 'Keyword'] (default: false),
  //    endUserNodeIds: end user nodes to query for (default: false),
  //  }
  async query(params){
    let result = await agent.post('http://localhost:3000/query', params);
    let items = imm.fromJS(result.body);
    let focusedItem;

    //Keep the focused item in case query returns empty
    if (items.size > 0){
      focusedItem = items.getIn([0, 'startNode'], imm.Map());

    }
    else {
      focusedItem = this.state.latestItem;
    }

    this.setState({
      queriedItems: new imm.List()
    }, () => {
      this.setState({
        queriedItems: imm.fromJS(result.body),
        latestItem: focusedItem,
        focusedItem: focusedItem
      });
    });
  }

  async componentWillMount() {
    this.socket.on('system-event', msg => {
      // redux
      this.props.dispatch({
        type: 'NEW_HISTORY_ITEM',
        value: msg,
      });

      let newParams = this.state.params;
      newParams.nodeId = msg.data.nodeId;
      if (this.state.autoswitch){
        this.query(newParams);
      }
    });



    try{
      let userJsonResult = await agent.post('http://localhost:3000/api/user/userjson');
      let userJson = userJsonResult.body;
      let userId = userJson.id;
      let username = userJson.username
      let teamMembersResult = await agent.post('http://localhost:3000/api/user/teams/members', { userId })
      let teamMembers = imm.fromJS(teamMembersResult.body);
      console.log('userId/name', userId, username, teamMembers);
      let userObject = imm.fromJS({ id: userId, username: username, selected: false });
      let usersList = new imm.List();
      usersList = teamMembers.unshift(userObject);
      usersList = usersList.map(user => {
        user.selected = false;
        return user
      })


      let teamsResult = await agent.post('http://localhost:3000/api/user/teams', { userId });
      let teams = teamsResult.body;

      this.setState({
        teams : imm.List(teams),
        users: usersList
      });
    }
    catch(e){

    }

    // let {userId, username} = localStorage;


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

  async _handleEventTickerItemClick(nodeId) {
    let params = this.state.params;
    params.nodeId = nodeId;

    this.props.dispatch(ActionCreators.fetchQueryItemsIfNeeded(nodeId, params));
  }

  toggleAutoswitch(){
    let newState = !this.state.autoswitch;
    this.setState({
      autoswitch: newState
    })
  }

  _focusedItem() {
    return this.state.focusedItem;
  }

  render() {
    let { queriedItems, dispatch, eventTickerItems } = this.props;

    let boundActions = bindActionCreators(ActionCreators, dispatch);

    let filters;
    if (eventTickerItems.size > 0){
      filters = <div style={LOCAL_STYLES.filterButtons}>
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
    }
    else{
      filters = <div></div>
    }

    return (
      <ViewWrapper>
        <div style={layout.container}>

          <Navbar />

          <UserList users={this.state.users} onClick={this.handleUserFilter.bind(this) } />

          <EventTickerList
            items={eventTickerItems}
            itemOnClick={this._handleEventTickerItemClick.bind(this)}
            {...boundActions} />

          {filters}

          <FocusedItem item={queriedItems.focusedNodeData} />

          <QueriedItemList
            items={queriedItems.items.toJS()}
            {...boundActions} />

          <div>
            <Toggle
              onToggle={this.toggleAutoswitch.bind(this)}
              toggle={this.state.autoswitch}
              label="Autoswitch"
              labelPosition="right"
              style={styles.toggle}
            />
          </div>

          <hr />
            <pre>{
              JSON.stringify(queriedItems, null, 2)
            }</pre>
          <hr />
        </div>
      </ViewWrapper>
    );
  }
}

const styles = {
  block: {
    maxWidth: 250,
  },
  toggle: {
    color: 'white',
    padding: 10,
    backgroundColor: 'white',
    marginBottom: 16,
  },
};


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

export default connect(
  // mapStateToProps
  state => ({
    eventTickerItems: state.eventTickerItems,
    queriedItems: state.queriedItems,
  })
)(MainView);
