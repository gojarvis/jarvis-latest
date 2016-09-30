import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import layout from 'styles/layout';
let agent = require('superagent-promise')(require('superagent'), Promise);
import {EventTickerList} from 'components/EventTicker';
import {ContextViewer} from 'components/ContextViewer'
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

import IconText from 'components/IconText'




let DashboardIcon = require('react-icons/lib/fa/dashboard');
let ConnectionExplorerIcon = require('react-icons/lib/fa/sitemap');
let SettingsIcon = require('react-icons/lib/md/settings-applications')

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
    this.socket.connect();

    this.socket.on('system-event', msg => {
      this.props.dispatch(ActionCreators.pushHistoryItem(msg));

      if (this.props.queriedItems.autoswitch){
        this.props.dispatch(ActionCreators.fetchQueryItemsIfNeeded(msg.data.nodeId));
      }
    });



    this.props.dispatch(ActionCreators.fetchUserAndTheirTeams());
  }

  async componentWillUnmount(){
    this.socket.off();
  }

  async componentDidMount(){
    this.socket.on('context-analysis-update', msg => {
      this.setState({
        temporalContextItems: imm.fromJS(msg.temporalContext),
        modifiers: imm.fromJS(msg.modifiers)
      }, ()=>{
        console.log('modifiers', msg.modifiers);
      })


    })
  }

  render() {
    let { queriedItems, dispatch, eventTickerItems } = this.props;
    let temporalContextItems = this.state.temporalContextItems;
    let boundActions = bindActionCreators(ActionCreators, dispatch);

    return (
      <ViewWrapper>
        <div>
          <div style={styles.sidebar}>
            <div style={styles.navbar.logo}>

            </div>
            <div style={styles.navbar.item.wrapper}>
                <DashboardIcon style={styles.navbar.item.content}/>
            </div>
            <div style={styles.navbar.item.wrapper}>
                <ConnectionExplorerIcon style={styles.navbar.item.content}/>
            </div>

          </div>
          <div style={styles.viewWrapper}>
            <div style={layout.container}>

              <EventTickerList
                items={eventTickerItems}
                {...boundActions} />

              <Filters selectedFilter={this.props.queriedItems.endNodeType} {...boundActions} />

              <FocusedItem item={queriedItems.focusedNodeData} />

              <QueriedItemList
                items={queriedItems.items.toJS()}
                isFetching={this.props.queriedItems.isFetching}
                {...boundActions} />

              <div style={styles.toggle}>
                <ContextViewer
                  items={temporalContextItems}
                  {...boundActions} />

                <Toggle
                  style={{padding: '10'}}
                  onToggle={() => { this.props.dispatch(ActionCreators.toggleAutoswitch()) }}
                  toggle={this.props.queriedItems.autoswitch}
                  label="Autoswitch"
                  labelPosition="right" />
              </div>

            </div>
          </div>
        </div>
      </ViewWrapper>
    );
  }
}

const styles = {
  block: {
    maxWidth: 250,
  },
  sidebar: {
    position: 'absolute',
    top:0,
    left:0,
    width: 80,
    bottom: 0,
    backgroundColor: 'rgb(31, 37, 48)'
  },
  viewWrapper: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    left: 80,
    zIndex: 10
  },
  navbar: {
    logo:{
      width: '70%',
      margin: '10px auto',
      backgroundColor: 'red',
      height: '55px'
    },
    item: {
      wrapper: {
        width: '80%',
        margin: '0 auto',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      },
      content: {
        fontSize: '30px',
        color: '#e1e1e1',
        backgroundColor: 'rgb(62, 66, 75)',
        padding: '13px'
      }
    }
  },
  toggle: {
    color: 'white',
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
