import { Component } from 'react';
import FB from 'styles/flexbox';
import Navbar from '../components/navbar';
import ViewWrapper from 'views/view-wrapper';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import SetUserRootPathForm from '../components/forms/setUserRootPathForm'

let agent = require('superagent-promise')(require('superagent'), Promise);

class ProfileView extends Component {
  constructor(...args) {
    super(...args);

    this.init();
    this.state ={
      user: {},
      teams: []
    }
  }

  async init(){

    agent.post('http://localhost:3000/api/user/userjson').then(async (res) => {
      let {username, role, id } = res.body
      let user = {username, role, id };

      this.setState({
          user: user
      });

      let teams = await this.getUserTeams(user)
      let teamInvites = await this.getTeamInvites(user);

      this.setState({
        teams: teams
      })
    });
  }

  async getUserTeamInvites(user){
    let res = await agent.post('http://localhost:3000/api/user/teams/invites', { userId: user.id})
    return res.body
  }

  async getUserTeams(user){
    let res = await agent.post('http://localhost:3000/api/user/teams', { userId: user.id})
    return res.body
  }


  async joinTeam(teamname){
    let username = this.state.username;
    let relationship = await agent.post('/api/user/join', {username, teamname});
  }

  async componentWillMount(){

  }

  render() {

    let teams = this.state.teams;
    let teamsButtons = teams.map((team, index) => {
      return (<RaisedButton
        key={index}
        onClick={ () => this.joinTeam(team.name) }
        label={team.name}
        primary={true}
        style={{flex: '1 1 auto', margin: 10}} />)

    })
    return (
      <ViewWrapper>
        <div style={{...LOCAL_STYLES.container}}>
          <Navbar />
          <div style={{...FB.base, ...FB.justify.start}}>
            <div style={{margin: '10px'}}>
              <div>Join Team</div>
              <div style={{margin: '10px'}}>
                <div>
                  {teamsButtons}
                </div>
                <div>
                  <SetUserRootPathForm user={this.state.user}/>

                </div>
                <div>

                </div>
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

export default ProfileView;
