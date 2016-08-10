import React from 'react';
import File from 'components/Icons/File';
import Browser from 'components/Icons/Browser';
import IconText from 'components/IconText';
import LinearProgress from 'material-ui/LinearProgress';
import FB from 'styles/flexbox';
let agent = require('superagent-promise')(require('superagent'), Promise);

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
      <div style={{color: "white", width: '100%'}}>
          <div>

          </div>
      </div>
    )
  }
}

const _styles = {
  container: {
    color: 'rgba(0, 0, 0, 1)',
    padding: 5,
    margin: 10,
    cursor: "pointer",
    borderRadius: 4,
  }
}

export default Navbar;
