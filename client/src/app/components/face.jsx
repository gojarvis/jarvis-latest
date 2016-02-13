import P5 from 'p5'
import 'p5/lib/addons/p5.sound'

import reactDom from 'react-dom'
const React = require('react');


const Face = React.createClass({
  getInitialState: function(){
    return ({
      eyes: {
        right: "@",
        left: "@"
      },
      mouth: "_______",
      blinked: false,
      radius: 100,
      p5on: false
    })
  },
  componentDidMount: function(){
    // this.hum();
    let socket = window.socket;
    this.init(socket);
    this.setState({socket: socket})
  },

  componentWillReceiveProps: function(nextProps) {
    //
    //
    // if (typeof this.state.p5Instance === 'undefined'){
    //   let p5Instance = new P5(s)
    //   this.setState({
    //     p5Instance : p5Instance
    //   })
    // }


  },

  init(socket){

    console.log('init');
    let x = 100;
    let y = 100;
    let ySpeed = 0;
    let xSpeed = 0;

    const s = function (p) {

      p.setup = function () {
        let x = 100;
        let y = 100;

        p.createCanvas(900, 600)
        y = y + ySpeed;
        x = x + xSpeed;

        socket.on('faceIn', function(msg){
          let {frame, position} = msg;
          // console.log(frame);
          // let {direction} = msg;
          // if (typeof direction === 'undefined') return;
          // console.log(msg, direction);
          //
          // let ySpeed = 0;
          // let xSpeed = 0;
          // //
          // switch(direction){
          //   case 'right':
          //   xSpeed = xSpeed + 100;
          //   break;
          //   case 'left':
          //   xSpeed = xSpeed - 100;
          //   break;
          //   case 'up':
          //   ySpeed = ySpeed - 1;
          //   break;
          //   case 'down':
          //   ySpeed = -y;
          //   xSpeed = -x;
          //   break;
          // }

          x = position.x * 2 + 300;
          y = position.z * 2 + 300;
          p.background(0)
          p.fill(255)
          p.rect(x, y, 300 - 10 * (position.y / 3),300 - 10 * (position.y / 3))

        })


      }

      p.draw = function () {
        // Moving up at a constant speed
        // console.log(xSpeed);

      }
    }

     new P5(s)
  },

  closeEyes: function(){
    this.setState({
      eyes: {
        right: "--",
        left: "--"
      }
    })
  },
  openEyes: function(){
    this.setState({
      eyes: {
        right: "@",
        left: "@"
      }
    })
  },
  recordingEyes: function(){
    // this.setState({
    //   eyes: {
    //     right: "^",
    //     left: "^",
    //     mouth: "_______"
    //   }
    // })
  },
  blink: function(){
    let rnd = Math.random();
    if (rnd > 0.60){
      this.closeEyes();
      this.wait(rnd * 800, this.openEyes);
    }
  },
  hum: function(){
      this.wait(Math.floor(Math.random() * 4000) + 1000, function(){
        if (!this.props.recording){
          // this.blink();
        }
        else{
          // this.recordingEyes();
        }
        this.hum();
      }.bind(this))


  },
  wait: function(delay, func) {
    return setTimeout(func, delay);
  },

  render(){


    // let style = {
    //     face: {
    //       eyes: {
    //         fontSize: "80px"
    //       },
    //       mouth: {
    //         fontSize: "80px"
    //       },
    //     },
    //     container: {
    //        display: "flex",
    //        flexDirection: "row",
    //        alignItems: "center",
    //        justifyContent: "center"
    //     }
    // };
    return (
      <div>


      </div>
    )
  },
})


module.exports = Face;
