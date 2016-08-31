import { Component } from 'react';
import FB from 'styles/flexbox';
import Navbar from '../navbar';
import ViewWrapper from 'views/view-wrapper';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
let agent = require('superagent-promise')(require('superagent'), Promise);

class NewTeamForm extends Component {
  constructor(...args){
    super(...args);
     this.state = {
       teamname: ''
     }
  }

  updateTeamName(e){
    let teamname = e.target.value;
    console.log(teamname);
    this.setState({
      teamname
    })
  }

  async saveTeam(){
    let teamname = this.state.teamname;
    let relationship = await agent.post('/api/team/create', {teamname});
  }

  render () {
    return (
      <div style={{margin: '10px'}}>
        <div>
          <TextField hintStyle={{color: 'white'}} hintText="Team name" onKeyUp={ this.updateTeamName.bind(this) }/>

        </div>
        <div>
          <RaisedButton
            onClick={ () => this.saveTeam() }
            label={"Save"}
            primary={true}
            style={{flex: '1 1 auto', margin: 10}} />
        </div>
      </div>
    )
  }
}

export default NewTeamForm
