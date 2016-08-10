import React from 'react';
import File from 'components/Icons/File';
import Browser from 'components/Icons/Browser';
import IconText from 'components/IconText';
import LinearProgress from 'material-ui/LinearProgress';
import FB from 'styles/flexbox';
let agent = require('superagent-promise')(require('superagent'), Promise);
import RaisedButton from 'material-ui/RaisedButton';

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
      <div style={{...FB.base, ...FB.justify.start, ..._styles.container}}>
          <span style={{..._styles.logo}}>Jarvis</span>
          <div style={{..._styles.navigation, ...FB.justify.end}}>
            <RaisedButton
              style={{..._styles.button}}
              label={"Home"}
              primary={true}
              zIndex={5}  />
            <RaisedButton
              style={{..._styles.button}}
              label={"Teams"}
              primary={true}
              zIndex={5}  />
            <RaisedButton
              style={{..._styles.button}}
              label={"Profile"}
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

  },
  container: {
    color: 'white',
    padding: 15,
    cursor: "pointer",
    borderRadius: 4,
    minHeight: '30px',
    backgroundColor: 'black'
  }
}

export default Navbar;
