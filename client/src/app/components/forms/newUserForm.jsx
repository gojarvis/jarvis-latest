import { Component } from 'react';
import FB from 'styles/flexbox';
import Navbar from '../navbar';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
let agent = require('superagent-promise')(require('superagent'), Promise);

class NewUserForm extends Component {
  constructor(...args){
    super(...args);
     this.state = {
       username: '',
       role: ''
     }
  }

  static displayName = 'NewUserForm';

  updateUserName(e){
    let username = e.target.value;
    this.setState({
      username
    })
  }

  updateRole(e){
    let role = e.target.value;
    this.setState({
      role
    })
  }

  async saveUser(){
    let {username, role} = this.state;

    let user = await agent.post('/api/user/create', {username, role});
  }

  render () {
    return (
      <div style={{margin: '10px'}}>
        <div>
          <TextField hintStyle={{color: 'white'}} hintText="User name" onKeyUp={ this.updateUserName.bind(this) }/>
        </div>
        <div>
          <TextField hintStyle={{color: 'white'}} hintText="Role" onKeyUp={ this.updateRole.bind(this) }/>
        </div>
        <div>
          <RaisedButton
            onClick={ () => this.saveUser() }
            label={"Save"}
            primary={true}
            style={{flex: '1 1 auto', margin: 10}} />
        </div>
      </div>
    )
  }
}

export default NewUserForm
