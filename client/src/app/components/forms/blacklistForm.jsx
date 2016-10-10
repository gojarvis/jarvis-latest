import { Component } from 'react';
import FB from 'styles/flexbox';
import Navbar from '../navbar';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import UrlFilteringEditor from '../UrlFilteringEditor';
import Toggle from 'material-ui/Toggle';

let agent = require('superagent-promise')(require('superagent'), Promise);


class BlackListForm extends Component {
  constructor(...args) {
    super(...args);

    this.state = {
      expressions: [],
      blacklistEnabled: false
    }
  }

  static displayName = 'BlackListForm';

  componentWillMount() {
    this.getBlacklistExpressions();
    this.getBlackListStatus();
  }



  async toggleBlackList() {
    let newStatus = !this.state.blacklistEnabled;
    let res = await agent.post('/api/user/setFilterStatus', { filterType: 'blacklist', filterStatus: newStatus });
    let updatedStatus = res.body;
    this.setState({
      blacklistEnabled: newStatus
    })
  }

  async getBlackListStatus() {
    let res = await agent.post('/api/user/getFilterStatus', {filterType: 'blacklist' });
    console.log('got blacklist status', res.body.filterStatus);
    let blacklistEnabled = res.body.filterStatus
    this.setState( { blacklistEnabled })
  }

  async saveBlacklistExpression(expression) {
    let expressionType = 'blacklist';
    let relationshipBetweenUserExpression = await agent.post('/api/user/saveFilterExpression', {expression, expressionType});
    this.getBlacklistExpressions();
    return relationshipBetweenUserExpression;
  }

  async getBlacklistExpressions() {
    let res = await agent.post('/api/user/listFilterExpressions', {expressionType: 'blacklist'})
    let blacklistExpressions = res.body;
    this.setState({
      expressions: blacklistExpressions
    })
  }

  async deleteBlacklistExpression(expression) {
    let expressionType = 'blacklist';
    let deleted = await agent.post('/api/user/deleteFilterExpression', { expression, expressionType });
    this.getBlacklistExpressions();
    return deleted;
  }


  render () {
    let blacklistEnabledLabel = this.state.blacklistEnabled ? 'Black list enabled' : 'Black list disabled';
    let blacklistToggle = (
      <Toggle
        onToggle={() => { this.toggleBlackList() }}
        toggled={this.state.blacklistEnabled}
        labelPosition="right" />
    );

    return (
      <div>
        <ListItem primaryText={blacklistEnabledLabel} rightToggle={blacklistToggle} />
        <UrlFilteringEditor
          expressions={this.state.expressions}
          saveExpression={this.saveBlacklistExpression.bind(this)}
          deleteExpression={this.deleteBlacklistExpression.bind(this)} />
      </div>
    )
  }
}

BlackListForm.propTypes = {

};

BlackListForm.defaultProps = {

};

export default BlackListForm
