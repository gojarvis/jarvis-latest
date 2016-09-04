import { Component } from 'react';
import FB from 'styles/flexbox';
import Navbar from 'components/navbar';
import ViewWrapper from 'views/view-wrapper';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import SetUserRootPathForm from 'components/forms/setUserRootPathForm'
import SetUserRepoCredentialsForm from 'components/forms/setUserRepoCredentialsForm'
import SetUserActivityManagerForm from 'components/forms/setUserActivityManagerForm'
import WhiteListForm from 'components/forms/whitelistForm';
import BlackListForm from 'components/forms/blacklistForm';

let agent = require('superagent-promise')(require('superagent'), Promise);

class ProfileView extends Component {
  constructor(...args) {
    super(...args);

    this.state ={
      user: {},
      teams: [],
      invites: []
    }

    this.init();
  }

  async init() {

    agent.post('http://localhost:3000/api/user/userjson').then(async (res) => {
      let {username, role, id } = res.body
      let user = {username, role, id };

      this.setState({
          user: user
      });

      let teams = await this.getUserTeams(user)
      let teamInvites = await this.getUserTeamInvites(user);
      this.setState({
        teams: teams,
        invites: teamInvites
      })
    });
  }



  async getUserTeamInvites(user) {
    let res = await agent.post('http://localhost:3000/api/user/teams/invites', { username: user.username})
    return res.body
  }

  async getUserTeams(user) {
    let res = await agent.post('http://localhost:3000/api/user/teams', { userId: user.id})
    return res.body
  }

  async joinTeam(teamname) {
    let username = this.state.username;
    let relationship = await agent.post('/api/user/join', {username, teamname});
  }

  async componentWillMount() {

  }

  render() {

    let teams = this.state.teams;
    let teamsButtons = teams.map((team, index) => {
      return (
        <RaisedButton
          key={index}
          onClick={ () => this.joinTeam(team.name) }
          label={team.name}
          primary={true}
          style={{flex: '1 1 auto', margin: 10}} />
      )
    })

    let invites = this.state.invites;

    let invitesButtons = invites.map((team, index) => {
      return (
        <RaisedButton
          key={index}
          onClick={ () => this.joinTeam(team.name) }
          label={team.name}
          primary={false}
          style={{flex: '1 1 auto', margin: 10}} />
      )
    })

    let joinSegment;

    if (invitesButtons.length > 0) {
      joinSegment =
      (<div style={{margin: '10px'}}>
        <div>Join Team</div>
        <div style={{margin: '10px'}}>
          <div>
            {invitesButtons}
          </div>
        </div>
      </div>)
    }

    return (
      <ViewWrapper>
        <div style={{...LOCAL_STYLES.container}}>
          <Navbar />
          <div style={{marginLeft: '10px', marginTop: '20px', background: "#a19e9e", padding: "20px", color: 'black'}}>
            <div> {joinSegment} </div>

            <div style={LOCAL_STYLES.block}>
              <h3>Teams</h3>
              <div>
                {teamsButtons}
              </div>
            </div>

            <div style={LOCAL_STYLES.block}>
              <h3>Root Path</h3>
              <SetUserRootPathForm user={this.state.user}/>
            </div>

            <div style={LOCAL_STYLES.block}>
              <h3>Repo Credentials</h3>
              <SetUserRepoCredentialsForm user={this.state.user} />
            </div>

            <div style={LOCAL_STYLES.block}>
              <h3>Activity Manager Credentials</h3>
              <SetUserActivityManagerForm />
            </div>

            <div style={LOCAL_STYLES.block}>
              <WhiteListForm />
            </div>

            <div style={LOCAL_STYLES.block}>
              <BlackListForm />
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
    background: 'grey',
  },
  block: {
    margin: '10px',
    borderBottom: '1px solid #5f5f5f',
  },
};
export default ProfileView;
