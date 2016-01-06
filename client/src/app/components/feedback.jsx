import React from 'react';
import {Motion, spring} from 'react-motion';
import range from 'lodash.range';
import _ from 'lodash';
function reinsert(arr, from, to) {
  const _arr = arr.slice(0);
  const val = _arr[from];
  _arr.splice(from, 1);
  _arr.splice(to, 0, val);
  return _arr;
}

function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min);
}

const allColors = [
  '#EF767A', '#456990', '#49BEAA', '#49DCB1', '#EEB868', '#EF767A', '#456990',
  '#49BEAA', '#49DCB1', '#EEB868', '#EF767A',
];


const [count, width, height] = [10, 300, 100];
// indexed by visual position
const layout = range(count).map(n => {
  const row = Math.floor(n / 3);
  const col = n % 3;
  return [width * col, height * row];
});

const Feedback = React.createClass({
  getInitialState() {
    return {
      mouse: [0, 0],
      delta: [0, 0], // difference between mouse and circle pos, for dragging
      lastPress: null, // key of the last pressed component
      isPressed: false,
    };
  },

  componentDidMount() {
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  },

  handleTouchStart(key, pressLocation, e) {
    this.handleMouseDown(key, pressLocation, e.touches[0]);
  },

  handleTouchMove(e) {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
  },

  handleMouseMove({pageX, pageY}) {
    const {lastPress, isPressed, delta: [dx, dy]} = this.state;
    if (isPressed) {
      const mouse = [pageX - dx, pageY - dy];
      this.setState({mouse: mouse});
    }
  },

  handleMouseDown(key, [pressX, pressY], {pageX, pageY}) {
    this.setState({
      lastPress: key,
      isPressed: true,
      delta: [pageX - pressX, pageY - pressY],
      mouse: [pressX, pressY],
    });
  },

  handleMouseUp() {
    this.setState({isPressed: false, delta: [0, 0]});
  },



  render() {
    // let balls = range(0,this.props.tick);

    let balls = this.props.items

    const {lastPress, isPressed, mouse} = this.state;
    let width = 3000;
    let containerStyle = {
        display: "block",
        position: "relative"
    }

    return (
      <div style={containerStyle}>
        {
          balls.map((item, key) => {

            let x = 50;
            let y = 80 + (key * 80);
            let op = 1;
            // let y = Math.sin(key) * 400 * Math.sin(this.props.tick);



            let text = "";
            let backgroundColor = "rgba(132, 115, 26, 0)"
            switch(item.type){
              case 'url':
                text = item.url;
                backgroundColor = "rgba(137, 175, 234, 0.23)"
              break;
              case 'file':
                text = _.last(item.uri.split("/"));
                backgroundColor = "rgba(160, 234, 137, 0.23)"
                x = x + 400;
              break;
            }



            let style = {
              translateX: spring(x , [20,30]),
              translateY: spring(y, [20,30]),
              scale: 1,
              boxShadow: 1,
              opacity: spring(op)
            };

            return (
              <Motion key={key} style={style}>
                {({translateX, translateY, scale, boxShadow, opacity}) =>
                   <div
                     className="suggestion"
                     style={{
                       backgroundColor: `${backgroundColor}`,
                       WebkitTransform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                       transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                       boxShadow: `${boxShadow}px 2px 9px rgba(0,0,0,0.5)`,
                       opacity: `${opacity}`
                     }}
                   >
                   <div className="suggestion-text">
                     {text}
                   </div>
                 </div>

                 }
              </Motion>
            )
          })
        }
      </div>
    );
  },
});

export default Feedback;
