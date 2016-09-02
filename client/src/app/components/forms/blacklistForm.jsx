import { Component } from 'react';
import FB from 'styles/flexbox';
import Navbar from '../navbar';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import UrlFilteringEditor from '../UrlFilteringEditor';

let agent = require('superagent-promise')(require('superagent'), Promise);


class BlackListForm extends Component {
  constructor(...args){
    super(...args);

    this.state = {
      expressions: []
    }
  }

  componentWillMount(){
    this.getBlacklistExpressions();
  }

  async saveBlacklistExpression(expression){

    let expressionType = 'blacklist';
    let relationshipBetweenUserExpression = await agent.post('/api/user/saveFilterExpression', {expression, expressionType});
    this.getBlacklistExpressions()
    return relationshipBetweenUserExpression

  }

  async getBlacklistExpressions(){
    let res = await agent.post('/api/user/listFilterExpressions', {expressionType: 'blacklist'})
    let blacklistExpressions = res.body;
    this.setState({
      expressions: blacklistExpressions
    })
  }

  async deleteBlacklistExpression(expression){
    let expressionType = 'blacklist';
    let deleted = await agent.post('/api/user/deleteFilterExpression', {expression, expressionType})
  }

  render () {
    console.log('Rendering', this.state.expressions);
    return (
      <div style={{margin: '10px'}}>
        <UrlFilteringEditor expressions={this.state.expressions} saveExpresion={this.saveBlacklistExpression.bind(this)}/>
      </div>
    )
  }
}

BlackListForm.propTypes = {

};

BlackListForm.defaultProps = {

};

export default BlackListForm
