import {Component, PropTypes} from 'react';
import File from 'components/Icons/File';
import Browser from 'components/Icons/Browser';
import IconText from 'components/IconText';
import FB from 'styles/flexbox';
let agent = require('superagent-promise')(require('superagent'), Promise);
import SvgIcon from 'material-ui/SvgIcon';
import mui, { RaisedButton } from 'material-ui';
import LoadingIndicator from 'components/LoadingIndicator';

class Navbar extends Component {
  super(){
    this.state = {

    }
  }

  logout(){
    agent.post('http://localhost:3000/logout').then((res)=> {
      this.context.router.push('/');
    });
  }
  getChildContext()
   {

      //  return { muiTheme: ThemeManager.getCurrentTheme() };
   }

  navigate(target){
      this.context.router.push('/' + target);
  }
  componentWillMount(){
    agent.post('http://localhost:3000/api/team/all').then((res)=> {
      console.info('res', res);
    });
  }

  render() {
    return (
      <div style={{...FB.base, ..._styles.container}}>
          <div style={{..._styles.logo}}>
            <span>Jarvis</span>
            <LoadingIndicator />
          </div>
          <div style={{..._styles.navigation, ...FB.justify.end}}>
            <RaisedButton
              icon={<HomeIcon style={iconStyles} />}
              style={{..._styles.button}}
              label={"Home"}
              onClick={this.navigate.bind(this, "main")}
              primary={true}
              zIndex={5}  />
            <RaisedButton
              style={{..._styles.button}}
              icon={<TeamIcon style={iconStyles} />}
              label={"Teams"}
              onClick={this.navigate.bind(this, "teams")}
              primary={true}
              zIndex={5}  />
            <RaisedButton
              style={{..._styles.button}}
              label={"Profile"}
              onClick={this.navigate.bind(this, "profile")}
              primary={true}
              zIndex={5}  />
            <RaisedButton
              style={{..._styles.button}}
              label={"Logout"}
              onClick={this.logout.bind(this)}
              primary={true}
              zIndex={5}  />
          </div>
      </div>
    )
  }
}

const _styles = {
  logo: {
    fontSize: '30px',
    marginRight: '50px',


  },
  button: {
    marginRight: '20px'
  },
  navigation: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  container: {
    color: 'white',
    padding: 15,
    cursor: 'pointer',
    borderRadius: 4,
    minHeight: '30px',
    backgroundColor: 'black',
    display: 'flex',
    justifyContent: 'space-between'
  }
}

const iconStyles = {
  marginRight: 5,
};
const HomeIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </SvgIcon>
);

const TeamIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z"/>
    <path d="M0 0h24v24H0z" fill="none"/>

  </SvgIcon>
)

Navbar.contextTypes = {
  router: PropTypes.object.isRequired
};

export default Navbar;
