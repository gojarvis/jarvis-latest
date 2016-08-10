import React from 'react';
import File from 'components/Icons/File';
import Browser from 'components/Icons/Browser';
import IconText from 'components/IconText';
import LinearProgress from 'material-ui/LinearProgress';
import FB from 'styles/flexbox';
let agent = require('superagent-promise')(require('superagent'), Promise);
import RaisedButton from 'material-ui/RaisedButton';
import SvgIcon from 'material-ui/SvgIcon';


class Navbar extends React.Component {
  super(){
    this.state = {

    }
  }
  componentWillMount(){
    agent.post('http://localhost:3000/api/team/all').then((res)=> {
      console.log('res', res);
    });
  }

  render() {
    return (
      <div style={{...FB.base, ..._styles.container}}>
          <span style={{..._styles.logo}}>Jarvis</span>
          <div style={{..._styles.navigation, ...FB.justify.end}}>
            <RaisedButton
              icon={<HomeIcon style={iconStyles} />}
              style={{..._styles.button}}
              label={"Home"}
              primary={true}
              zIndex={5}  />
            <RaisedButton
              style={{..._styles.button}}
              icon={<TeamIcon style={iconStyles} />}
              label={"Teams"}
              primary={true}
              zIndex={5}  />
            <RaisedButton
              style={{..._styles.button}}
              label={"Profile"}
              primary={true}
              zIndex={5}  />
            <RaisedButton
              style={{..._styles.button}}
              label={"Logout"}
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

export default Navbar;
