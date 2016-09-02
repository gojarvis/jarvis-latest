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
  constructor(...args){
    super(...args);

    this.state = {
      expressions: []
    }
  }

  componentWillMount(){
    this.getWhitelistExpressions();
    this.getWhiteListStatus();
  }

  async saveWhitelistExpression(expression){

    let expressionType = 'whitelist';
    let relationshipBetweenUserExpression = await agent.post('/api/user/saveFilterExpression', {expression, expressionType});
    this.getWhitelistExpressions()
    return relationshipBetweenUserExpression

  }

  async toggleWhiteList(){
    let newStatus = !this.state.whitelistEnabled;
    let res = await agent.post('/api/user/setFilterStatus', { filterType: 'whitelist', filterStatus: newStatus });
    let updatedStatus = res.body;
    this.setState({
      whitelistEnabled: newStatus
    })
  }

  async getWhiteListStatus(){
    let res = await agent.post('/api/user/getFilterStatus', {filterType: 'whitelist' });
    console.log('got whitelist status', res.body.filterStatus);
    let whitelistEnabled = res.body.filterStatus
    this.setState( { whitelistEnabled })
  }

  async getWhitelistExpressions(){
    let res = await agent.post('/api/user/listFilterExpressions', {expressionType: 'whitelist'})
    let whitelistExpressions = res.body;
    this.setState({
      expressions: whitelistExpressions
    })
  }

  async deleteWhitelistExpression(expression){
    let expressionType = 'whitelist';
    let deleted = await agent.post('/api/user/deleteFilterExpression', {expression, expressionType})
  }


  render () {
    return (
      <div style={{margin: '10px'}}>
        <UrlFilteringEditor expressions={this.state.expressions} saveExpresion={this.saveWhitelistExpression.bind(this)}/>
          <Toggle
            onToggle={() => { this.toggleWhiteList() }}
            toggled={this.state.whitelistEnabled}
            label="Whitelist"
            labelPosition="right" />
      </div>
    )
  }
}

WhiteListForm.propTypes = {

};

WhiteListForm.defaultProps = {

};

export default WhiteListForm
