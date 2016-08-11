import { Component } from 'react';
import FB from 'styles/flexbox';
import Navbar from '../components/navbar';
import ViewWrapper from 'views/view-wrapper';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';


let agent = require('superagent-promise')(require('superagent'), Promise);

class TeamsView extends Component {
  constructor(...args) {
    super(...args);
    this.state ={
      users: []
    }
  }

  async getUserTeam(user){
    let res = await agent.post('http://localhost:3000/api/user/teams', { userId: user.id})
    return {user, teams: res.body}
  }

  async associateUserWithTeam(){
    let username = this.state.username;
    let teamname = this.state.teamname;
    let relationship = await agent.post('/api/user/associate', {username, teamname});
  }

  async componentWillMount(){
    let usersResult = await agent.post('http://localhost:3000/api/user/all');
    let users = usersResult.body;
    let usersTeams = await Promise.all(users.map( user => {return this.getUserTeam(user)}))
    // let usersTeams = usersTeamResponses.(res => { return res.body});
    this.setState({ users: usersTeams })

  }

  render() {
    return (
      <ViewWrapper>
        <div style={{...LOCAL_STYLES.container}}>
          <Navbar />
          <div style={{...FB.base, ...FB.justify.start}}>
            <List>
            {this.state.users.map((item, index) => {
              return <ListItem key={index} style={{...LOCAL_STYLES.item}}>
                <span >{item.user.username} </span>
                <span>
                  {
                    item.teams.map((team, index) => {
                      return <span key={index}>{team.name}</span>
                    })
                  }
                </span>
              </ListItem>
            })}
          </List>

          </div>

          <div style={{margin: '10px'}}>
            <div>Assign User to Team</div>
            <div style={{margin: '10px'}}>
              <div>
                <TextField hintStyle={{color: 'white'}} hintText="User Github username" />
              </div>
              <div>
                <TextField hintStyle={{color: 'white'}} hintText="Team name" />

              </div>
              <div>
                <RaisedButton

                  label={"Save"}
                  primary={true}
                  style={{flex: '1 1 auto', margin: 10}} />
              </div>
            </div>

          </div>
        </div>
      </ViewWrapper>
    );
  }
}

const LOCAL_STYLES = {
  container: {
    fontFamily: "arial",
    minHeight: "100vh",
    backgroundColor: "rgb(40, 44, 52)",
    color: '#fff',
    overflow: 'auto',
  },

  item: {
    margin: "10px",
    padding: "10px",
    color: "white",
    background: 'grey'
  }
};

export default TeamsView;
