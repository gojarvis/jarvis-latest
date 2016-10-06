import { Component } from 'react';
import FB from 'styles/flexbox';
import Navbar from 'components/navbar';
import ViewWrapper from 'views/view-wrapper';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
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
        <div style={styles.block}>
          <div>Join Team</div>

          <div>
            {invitesButtons}
          </div>
        </div>
      </div>)
    }

    return (
      <ViewWrapper>

        <div style={{...styles.container}}>
          <div style={{...styles.header}}>Settings</div>
          <div style={{background: '#efefef', color: '#333'}}>
            <div> {joinSegment} </div>


            <div style={styles.block}>
              <Title>Teams</Title>
              <div>
                {teamsButtons}
              </div>
            </div>

            <div style={styles.block}>
              <Title>Root Path</Title>
              <Subtitle>Jarvis will track projects in this folder</Subtitle>
              <SetUserRootPathForm user={this.state.user}/>
            </div>

            {/*<div style={styles.block}>
              <Title>Repo Credentials</Title>
              <SetUserRepoCredentialsForm user={this.state.user} />
            </div>

            <div style={styles.block}>
              <Title>Activity Manager Credentials</Title>
              <SetUserActivityManagerForm />
            </div>*/}

            <div style={styles.block}>
              <Title>White List</Title>
              <Subtitle>If enabled, only URLs matching the white list regular expression will be tracked (the rest will not) </Subtitle>
              <WhiteListForm />
            </div>

            <div style={styles.block}>
              <Title>Black List</Title>
              <Subtitle>If enabled, URLs matching the black list regular expression will not be tracked </Subtitle>
              <BlackListForm />
            </div>
          </div>
        </div>
      </ViewWrapper>
    );
  }
}

const Title = (props) => {
  return (
    <div style={{fontSize: 18, fontWeight: '700'}}>{props.children}</div>
  )
}

const Subtitle = (props) => {
  return (
    <div style={{fontSize: 12, fontWeight: '500', color: 'grey'}}>{props.children}</div>
  )
}

const styles = {
  container: {
    fontFamily: '"Lucida Grande", "Segoe UI", Ubuntu, Cantarell, sans-serif',
    minHeight: "100vh",
    backgroundColor: "rgb(40, 44, 52)",
    color: '#fff',
    overflow: 'auto',
  },
  header: {
    backgroundColor: "rgb(40, 44, 52)",
    fontSize: '20px',    
    padding: '10px'
  },
  subContainer: {marginLeft: '10px', marginTop: '20px', background: "#a19e9e", padding: "20px", color: 'black'},
  item: {
    margin: "10px",
    padding: "10px",
    color: "white",
    background: 'grey',
  },
  block: {
    padding: '10px',
    borderBottom: '1px solid #5f5f5f',
  },
};
export default ProfileView;
