import { Component } from 'react';
import FB from 'styles/flexbox';
import Navbar from '../navbar';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import UrlFilteringEditor from '../UrlFilteringEditor';

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
  }

  async saveWhitelistExpression(expression){

    let expressionType = 'whitelist';
    let relationshipBetweenUserExpression = await agent.post('/api/user/saveFilterExpression', {expression, expressionType});
    this.getWhitelistExpressions()
    return relationshipBetweenUserExpression

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
      </div>
    )
  }
}

WhiteListForm.propTypes = {

};

WhiteListForm.defaultProps = {

};

export default WhiteListForm
