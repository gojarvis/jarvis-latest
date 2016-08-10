import { Component } from 'react';
import layout from 'styles/layout';
import _ from 'lodash';
let agent = require('superagent-promise')(require('superagent'), Promise);
import {EventTickerList} from 'components/EventTicker';
import QueriedItemList from 'components/QueriedItemList';
import ViewWrapper from 'views/view-wrapper';
import FocusedItem from 'components/FocusedItem';
import imm from 'immutable';

class MainView extends Component {
  constructor(...args) {
    super(...args);
    this.socket = window.socket;

    this.state = {
      eventTickerItems: new imm.List(),
      users: new imm.List(),
      queriedItems: new imm.List(),
      teams: new imm.List()
    }
  }

  async componentWillMount() {
    this.socket.on('system-event', msg => {
      this.setState({
        eventTickerItems: this.state.eventTickerItems.unshift(msg)
      });
    });

    let {userId, username} = localStorage;

    agent.post('http://localhost:3000/getTeamMembers', { userId }).then((res) => {
      let users = new imm.List([{ id: userId, username }]);
      // TODO: add type/error checking
      users = users.concat(res.body);
      this.setState({ users });
    });

    agent.post('http://localhost:3000/user/getTeams', { userId }).then((res) => {
      this.setState({
        teams : imm.List(res.body)
      });
    });
  }

  async _handleEventTickerItemClick(nodeId) {
    let result = await agent.post('http://localhost:3000/query', { nodeId });
    setTimeout(() => {
      this.setState({
        queriedItems: new imm.List()
      }, () => {
        this.setState({
          queriedItems: imm.fromJS(result.body)
        });
      });
    }, 200);
  }

  _focusedItem() {
    return this.state.queriedItems.getIn([0, 'startNode'], imm.Map());
  }

  render() {
    return (
      <ViewWrapper>
        <div style={layout.container}>
          <EventTickerList
            items={this.state.eventTickerItems}
            itemOnClick={this._handleEventTickerItemClick.bind(this)} />

          <hr />

          <FocusedItem item={this._focusedItem()} />

          <hr />

          <QueriedItemList
            items={this.state.queriedItems.toJS()}
            onClick={this._handleEventTickerItemClick.bind(this)} />
        </div>
      </ViewWrapper>
    );
  }
}

export default MainView;
