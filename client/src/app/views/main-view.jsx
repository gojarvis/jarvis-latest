import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import layout from 'styles/layout';
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
      temporalContextItems: []
    }
  }

  componentWillReceiveProps(nextProps) {
    let checkProps = ['focusedNodeId', 'endNodeType', 'endUserNodeIds'];
    let willFetch = false;
    checkProps.forEach((item, index) => {
      if (nextProps.queriedItems.focusedNodeId !== undefined &&
        nextProps.queriedItems.focusedNodeId !== -1 &&
        this.props.queriedItems[item] !== nextProps.queriedItems[item]) {
        willFetch = true;
      }
    })

    if (willFetch) {
      this.props.dispatch(ActionCreators.fetchQueryItemsIfNeeded(nextProps.queriedItems.focusedNodeId));
    }
  }

  async componentWillMount() {
    let res = await agent.get('http://localhost:3000/init');
    this.socket.on('system-event', msg => {
      this.props.dispatch(ActionCreators.pushHistoryItem(msg));

      if (this.props.queriedItems.autoswitch){
        this.props.dispatch(ActionCreators.fetchQueryItemsIfNeeded(msg.data.nodeId));
      }
    });



    this.props.dispatch(ActionCreators.fetchUserAndTheirTeams());
  }

  async componentDidMount(){
    this.socket.on('context-analysis-update', msg => {
      this.setState({
        temporalContextItems: imm.fromJS(msg.temporalContext)
      })
    })
  }

  render() {
    let { queriedItems, dispatch, eventTickerItems } = this.props;
    let temporalContextItems = this.state.temporalContextItems;
    let boundActions = bindActionCreators(ActionCreators, dispatch);

    return (
      <ViewWrapper>
        <div style={layout.container}>

          <Navbar />

          <UserList
            users={this.props.queriedItems.teamMembers}
            selectedUsers={this.props.queriedItems.endUserNodeIds}
            {...boundActions} />

          <EventTickerList
            items={eventTickerItems}
            {...boundActions} />

          <EventTickerList
            items={temporalContextItems}
            {...boundActions} />

          <Filters selectedFilter={this.props.queriedItems.endNodeType} {...boundActions} />

          <FocusedItem item={queriedItems.focusedNodeData} />

          <QueriedItemList
            items={queriedItems.items.toJS()}
            isFetching={this.props.queriedItems.isFetching}
            {...boundActions} />

          <div style={styles.toggle}>
            <Toggle
              onToggle={() => { this.props.dispatch(ActionCreators.toggleAutoswitch()) }}
              toggle={this.props.queriedItems.autoswitch}
              label="Autoswitch"
              labelPosition="right" />
          </div>

          {/*<hr />
            <pre>{
              JSON.stringify(queriedItems, null, 2)
            }</pre>
          <hr />*/}
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
    position: 'fixed',
    bottom: 0,
    width: '100%'
  },
};

export default connect(
  // mapStateToProps
  state => ({
    eventTickerItems: state.eventTickerItems,
    queriedItems: state.queriedItems
  })
)(MainView);
