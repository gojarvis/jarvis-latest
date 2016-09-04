import { PropTypes, Component } from 'react';
import FB from 'styles/flexbox';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import IconText from 'components/IconText';
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
    if (expression) {
      let result = this.props.saveExpression(expression)
      this.setState({expression: ''});
    }
  }

  updateExpression = (event) => {
    this.setState({
      expression: event.target.value
    });
  }


  render () {
    let expressionsListItems = this.props.expressions.map((expression, index) => {
      return (
        <ListItem key={index}>
          <IconText icon='trash' onClick={(e) => this.props.deleteExpression(expression)}>{expression.address}</IconText>
        </ListItem>
      );
    });

    return (
      <div>
        <h4>Expression list</h4>
        <List style={{background: '#bbbbbb', marginBottom: '20px'}}>
          {expressionsListItems}
        </List>
        <div>
          <div>Add expression</div>
          <TextField
            hintStyle={{color: '#464646'}}
            hintText="Expression"
            onChange={this.updateExpression}
            value={this.state.expression} />
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
    saveExpression: PropTypes.func,
    deleteExpression: PropTypes.func
};

UrlFilteringEditor.defaultProps = {
    expressions: []
};

export default UrlFilteringEditor
