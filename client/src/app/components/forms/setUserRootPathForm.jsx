import { Component } from 'react';
import FB from 'styles/flexbox';
import Navbar from '../navbar';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

let agent = require('superagent-promise')(require('superagent'), Promise);

class SetUserRootPathForm extends Component {
  constructor(...args){
     super(...args);


     this.state = {
       rootPath: ''
     }

     this.init()
  }

  async init(){
      let res = await agent.post('/api/user/getRootPath', {rootPath});
      let rootPath = res.body;
      this.setState({rootPath})
  }

  updateRootPath(e){
    let rootPath = e.target.value;
    this.setState({
      rootPath
    })
  }

  async saveRootPath(){
    let rootPath = this.state.rootPath;
    let relationship = await agent.post('/api/user/setRootPath', {rootPath});
  }

  render () {
    return (
      <div style={{margin: '10px'}}>
        <TextField
          hintStyle={{color: '#888'}}
          textStyle={{color: '#888'}}
          hintText="Root Path"
          value={this.state.rootPath}
          onChange={ this.updateRootPath.bind(this) }/>
        <RaisedButton
          onClick={ () => this.saveRootPath() }
          label={"Save"}
          primary={true}
          style={{flex: '1 1 auto', margin: 10}} />
      </div>
    )
  }
}


export default SetUserRootPathForm
