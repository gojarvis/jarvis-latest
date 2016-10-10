import { Component } from 'react';
import FB from 'styles/flexbox';
import Navbar from '../navbar';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import UrlFilteringEditor from '../UrlFilteringEditor';
import Toggle from 'material-ui/Toggle';

let agent = require('superagent-promise')(require('superagent'), Promise);


class WhiteListForm extends Component {
  constructor(...args) {
    super(...args);

    this.state = {
      expressions: []
    }
  }

  static displayName = 'WhiteListForm';

  componentWillMount() {
    this.getWhitelistExpressions();
    this.getWhiteListStatus();
  }

  async saveWhitelistExpression(expression) {
    let expressionType = 'whitelist';
    let relationshipBetweenUserExpression = await agent.post('/api/user/saveFilterExpression', {expression, expressionType});
    this.getWhitelistExpressions()
    return relationshipBetweenUserExpression
  }

  async toggleWhiteList() {
    let newStatus = !this.state.whitelistEnabled;
    let res = await agent.post('/api/user/setFilterStatus', { filterType: 'whitelist', filterStatus: newStatus });
    let updatedStatus = res.body;
    this.setState({
      whitelistEnabled: newStatus
    })
  }

  async getWhiteListStatus() {
    let res = await agent.post('/api/user/getFilterStatus', {filterType: 'whitelist' });
    console.log('got whitelist status', res.body.filterStatus);
    let whitelistEnabled = res.body.filterStatus
    this.setState( { whitelistEnabled })
  }

  async getWhitelistExpressions() {
    let res = await agent.post('/api/user/listFilterExpressions', {expressionType: 'whitelist'})
    let whitelistExpressions = res.body;
    this.setState({
      expressions: whitelistExpressions
    })
  }

  async deleteWhitelistExpression(expression) {
    console.log('delete: ', expression)
    let expressionType = 'whitelist';
    let deleted = await agent.post('/api/user/deleteFilterExpression', { expression, expressionType });
    this.getWhitelistExpressions();
    return deleted;
  }


  render () {
    let whitelistEnabledLabel = this.state.whitelistEnabled ? 'White list enabled' : 'White list disabled';
    let whitelistToggle = (
      <Toggle
        onToggle={() => { this.toggleWhiteList() }}
        toggled={this.state.whitelistEnabled}
        labelPosition="right" />
    );
    return (
      <div>
        <ListItem primaryText={whitelistEnabledLabel} rightToggle={whitelistToggle} />
        <UrlFilteringEditor
          expressions={this.state.expressions}
          saveExpression={this.saveWhitelistExpression.bind(this)}
          deleteExpression={this.deleteWhitelistExpression.bind(this)} />
      </div>
    )
  }
}

WhiteListForm.propTypes = {

};

WhiteListForm.defaultProps = {

};

export default WhiteListForm
