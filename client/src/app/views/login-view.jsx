import {Component} from 'react';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton'
import FB from 'styles/flexbox';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
let agent = require('superagent-promise')(require('superagent'), Promise);

class LoginView extends Component {
  constructor() {
    super();
  }

  async componentWillMount() {
    let userData = await agent.get('/userjson');
    console.log('User Data: ', userData.body)
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <div style={{...FB.base, ...FB.justify.center, ...FB.align.center, height: '100vh', width: '100vw'}}>
          <div style={{background: '#fff', borderRadius: 2}}>
            <FlatButton
              style={{cursor: 'pointer', padding: '0 20px'}}
              onClick={() => {window.location.href = "http://localhost:3000/auth/github" }}>
              <i className="fa fa-lg fa-github" aria-hidden="true"></i>
              <span style={{marginLeft: 5}}>Login with GitHub</span>
            </FlatButton>
          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}

export default LoginView;
