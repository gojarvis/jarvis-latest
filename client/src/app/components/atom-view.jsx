import React from 'react';
import imm from 'immutable';
import Radium, { Style } from 'radium';
import { STYLES, COLORS } from '../styles';
import {mouseTrap} from 'react-mousetrap';



class AtomView extends React.Component {
  constructor(){
    super();

    this.socket = window.socket
  }
  componentWillMount() {
    this.socket.on('system-event', msg => {
      console.log('system-event', msg);
    })

  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState) {

  }

  render(){
    let items = [0,1,2,3,4,5,6,7,8,9,10];
    let cards = items.map( index => {
      return (
        <div style={{width: "90vw", backgroundColor: "rgba(80, 195, 210, 0.67)", padding: "13px", margin: "0 auto", marginBottom: "15px"}}>
          Hello {index}
        </div>
      )
    })
    return(
      <div style={{ fontFamily: "arial", height: "100vh", backgroundColor: "rgb(40, 44, 52)"}}>
        <div style={{padding: "10px"}}>
          {cards}
        </div>
      </div>
    )
  }
}

export default mouseTrap(Radium(AtomView));
