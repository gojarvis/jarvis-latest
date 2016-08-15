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
import Filters from 'components/Filters';

class MainView extends Component {
  constructor(...args) {
    super(...args);
    this.socket = window.socket;

    this.state = {
      eventTickerItems: new imm.List(),
      users: new imm.List(),
      teams: new imm.List(),
      filters: [
        { key: "", selected: true, label: "All", type: null },
        { key: "files", selected: false, label: "Files", type: 'File' },
        { key: "urls", selected: false, label: "URLs", type: 'Url' },
        { key: "keywords", selected: false, label: "Keywords", type: 'Keyword' },
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

  // static get defaultProps() {
  //   return {
  //     queriedItems: imm.List()
  //   }
  // }

  // componentDidMount() {
  //   let { dispatch } = this.props;
  // }

  componentWillReceiveProps(nextProps) {
    // let checkItems = ['focusedNodeId', 'endNodeType'];
    let checkItems = ['endNodeType'];
    checkItems.forEach((item, index) => {
      if (nextProps.queriedItems.focusedNodeId !== undefined &&
        nextProps.queriedItems.focusedNodeId !== -1 &&
        this.props.queriedItems[item] !== nextProps.queriedItems[item]) {
        this.props.dispatch(ActionCreators.fetchQueryItemsIfNeeded(nextProps.queriedItems.focusedNodeId));
      }
    })
  }

  async componentWillMount() {
    this.socket.on('system-event', msg => {
      this.props.dispatch(ActionCreators.pushHistoryItem(msg));

      if (this.props.queriedItems.autoswitch){
        this.props.dispatch(ActionCreators.fetchQueryItemsIfNeeded(msg.data.nodeId));
      }
    });



    try {
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
    } catch(e) {

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

  toggleAutoswitch(){
    this.props.dispatch(ActionCreators.toggleAutoswitch());
  }

  render() {
    let { queriedItems, dispatch, eventTickerItems } = this.props;

    let boundActions = bindActionCreators(ActionCreators, dispatch);

    return (
      <ViewWrapper>
        <div style={layout.container}>

          <Navbar />

          <UserList users={this.state.users} onClick={this.handleUserFilter.bind(this) } />

          <EventTickerList
            items={eventTickerItems}
            {...boundActions} />

          <Filters selectedFilter={this.props.queriedItems.endNodeType} {...boundActions} />

          <FocusedItem item={queriedItems.focusedNodeData} />

          <QueriedItemList
            items={queriedItems.items.toJS()}
            {...boundActions} />

          <div>
            <Toggle
              onToggle={this.toggleAutoswitch.bind(this)}
              toggle={this.props.queriedItems.autoswitch}
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
