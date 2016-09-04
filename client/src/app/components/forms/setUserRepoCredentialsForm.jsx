import { Component } from 'react';
import FB from 'styles/flexbox';
import Navbar from '../navbar';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

let agent = require('superagent-promise')(require('superagent'), Promise);

class SetUserRepoCredentials extends Component {
  constructor(...args){
     super(...args);


     this.state = {
       address: '',
       username: '',
       password: ''
     }

     this.init()
  }

  async init(){
      // let res = await agent.post('/api/user/getRootPath', {rootPath});
      // let rootPath = res.body;
      // this.setState({rootPath})
  }

  updateRepoAddress(e){
    let address = e.target.value;
    this.setState({
      address
    })
  }

  updateRepoUsername(e){
    let username = e.target.value;
    this.setState({
      username
    })
  }

  updateRepoPassword(e){
    let password = e.target.value;
    this.setState({
      password
    })
  }

  async saveRepoCreds(){
    let {username, password, address} = this.state;
    let credentials = await agent.post('/api/user/setRepoCredentials', { username, password, address });
  }

  render () {
    return (
      <div style={{margin: '10px'}}>
        <div>
          <TextField hintStyle={{color: '#888'}} textStyle={{color: '#888'}} hintText="Repo Address" value={this.state.address} onChange={ this.updateRepoAddress.bind(this) }/>
        </div>
        <div>
          <TextField hintStyle={{color: '#888'}} textStyle={{color: '#888'}} hintText="Username" value={this.state.username} onChange={ this.updateRepoUsername.bind(this) }/>
        </div>
        <div>
          <TextField hintStyle={{color: '#888'}} textStyle={{color: '#888'}} hintText="Password" value={this.state.password} onChange={ this.updateRepoPassword.bind(this) }/>
        </div>
        <div>
          <RaisedButton
            onClick={ () => this.saveRepoCreds() }
            label={"Save"}
            primary={true}
            style={{flex: '1 1 auto', margin: 10}} />
        </div>
      </div>
    )
  }
}


export default SetUserRepoCredentials
