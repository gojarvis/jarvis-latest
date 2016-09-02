import { PropTypes, Component } from 'react';
import FB from 'styles/flexbox';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
let agent = require('superagent-promise')(require('superagent'), Promise);

class UrlFilteringEditor extends Component {
  constructor(...args){
    super(...args);
    this.state = {
      expression: ''
    }
  }

  componentDidMount() {

  }

  async save(){
    let {expression} = this.state;
    let result = this.props.saveExpresion(expression)
    this.setState({expression: ''})
  }

  updateExpression(e){
    let expression = e.target.value;
    this.setState({
      expression
    })
  }


  render () {
    let expressionsListItems = this.props.expressions.map( expression => {
      return (
        <ListItem>
          {expression.address}
        </ListItem>
      )

    })
    return (
      <div style={{margin: '10px'}}>
        <List>
          {expressionsListItems}
        </List>
        <div>
          <div>Add expression</div>
          <TextField hintStyle={{color: 'white'}} hintText="Expression" onKeyUp={ this.updateExpression.bind(this) }/>
          <div>
            <RaisedButton
              onClick={ () => this.save() }
              label={"Save"}
              primary={true}
              style={{flex: '1 1 auto', margin: 10}} />
          </div>
        </div>
      </div>
    )
  }
}

UrlFilteringEditor.propTypes = {
    expressions: PropTypes.array,
    saveExpression: PropTypes.function
};

UrlFilteringEditor.defaultProps = {
    expressions: []
};

export default UrlFilteringEditor
