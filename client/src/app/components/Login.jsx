import {Component} from 'react';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton'
import FB from 'styles/flexbox';

class Login extends Component {
  constructor() {
    super();
  }
  render() {
    return (
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
    )
  }
}

export default Login;
