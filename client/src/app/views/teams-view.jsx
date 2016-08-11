import { Component } from 'react';
import FB from 'styles/flexbox';
import Navbar from '../components/navbar';
import ViewWrapper from 'views/view-wrapper';
let agent = require('superagent-promise')(require('superagent'), Promise);

class TeamsView extends Component {
  constructor(...args) {
    super(...args);
  }

  async componentWillMount(){
    let usersResult = await agent.post('http://localhost:3000/api/user/all');
    let users = usersResult.body;

    console.log(users);

  }

  render() {
    return (
      <ViewWrapper>
        <div style={{...LOCAL_STYLES.container}}>
          <Navbar />
          <div style={{...FB.base, ...FB.justify.start}}>


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
  __oldEventTickerItem: {
    width: "5vw",
    padding: "13px",
    margin: "10px",
    marginBottom: "15px",
    display: "inline-block",
  },
  eventTickerItem: {
    minWidth: 100,
  },
  queriedItemsList: {
    padding: "20px",
    margin: "10px"
  },
  queriedItem: {},
  focusedItem: {
    margin: "10px",
    padding: "10px",
    color: "black"
  },
  filterButton: {
    ...FB.base,
    ...FB.justify.center,
    ...FB.flex.equal,
  },
  filterButtons: {
    ...FB.base,
    ...FB.justify.around,
  },
};

export default TeamsView;
