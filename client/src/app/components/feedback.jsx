import React from 'react';
import {Motion, spring} from 'react-motion';
import range from 'lodash.range';
import _ from 'lodash';
import Radium, { Style } from 'radium';
import Masonry from 'react-masonry-component';
import File from 'react-icons/lib/fa/File';
import ThumbsUp from 'react-icons/lib/fa/thumbs-up';
import ThumbsDown from 'react-icons/lib/fa/thumbs-down';

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
  // roieki
  '#EF767A',
  '#EF767A',
  '#EF767A',
  '#456990',
  '#456990',
  '#49BEAA',
  '#49BEAA',
  '#49DCB1',
  '#EEB868',
  '#EEB868',
  // parties
  '#3C3F42',
  '#2FD1E2',
  '#F4FAFF',
  '#EFF2EF',
  '#C93A67',
];

// const COLORS = {
//   FILE  : 'rgb(182, 169, 220)',
//   URL   : 'rgb(121, 194, 202)',
//   TEXT  : '#3C3F42'
// };

const COLORS = {
  FILE  : 'rgb(255, 255, 255)',
  URL   : 'rgb(255, 255, 255)',
  TEXT  : '#3C3F42'
};


const [count, width, height] = [10, 300, 100];
// indexed by visual position
const layout = range(count).map(n => {
  const row = Math.floor(n / 3);
  const col = n % 3;
  return [width * col, height * row];
});

const styles = {
  title: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 14,
    maxWidth: '100%'
  },
  suggestion: {
    fontFamily: 'Roboto',
    fontWeight: '400',
    boxShadow: `1px 2px 9px rgba(0,0,0,0.5)`,
    opacity: `1`,
    margin: '10px 10px 20px',
    display: 'inline-block',
    width: '80%',
    overflow:'hidden'
  },
  segment: {
    width: '100%'
  },
  text: {
    borderTop: '1px solid',
    borderColor: '#456990'
  },
  buttons: {
    // text > buttons
    padding: '10px 0',
    borderBottom: '1px solid #456990',
    display: 'flex',
    justifyContent: 'space-around',
  },
  cardList: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
}

class Feedback extends React.Component {
  constructor() {
    super();

    this.state = {
      mouse: [0, 0],
      delta: [0, 0], // difference between mouse and circle pos, for dragging
      lastPress: null, // key of the last pressed component
      isPressed: false,
    };
  }

  componentDidMount() {
    // window.addEventListener('touchmove', this.handleTouchMove);
    // window.addEventListener('touchend', this.handleMouseUp);
    // window.addEventListener('mousemove', this.handleMouseMove);
    // window.addEventListener('mouseup', this.handleMouseUp);
  }

  handleTouchStart(key, pressLocation, e) {
    this.handleMouseDown(key, pressLocation, e.touches[0]);
  }

  handleTouchMove(e) {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
  }

  handleMouseMove({pageX, pageY}) {
    let {lastPress, isPressed, delta: [dx, dy]} = this.state;
    if (isPressed) {
      const mouse = [pageX - dx, pageY - dy];
      this.setState({mouse: mouse});
    }
  }

  handleMouseDown(key, [pressX, pressY], {pageX, pageY}) {
    this.setState({
      lastPress: key,
      isPressed: true,
      delta: [pageX - pressX, pageY - pressY],
      mouse: [pressX, pressY],
    });
  }

  handleMouseUp() {
    this.setState({isPressed: false, delta: [0, 0]});
  }



  render() {
    let masonryOptions = {
        transitionDuration: '0.7s'
    };
    let childElements = this.props.items.map((item, key) => {
      let text = '';
      let backgroundColor = '';
      switch(item.type){
        case 'url':
          text = item.url;
          backgroundColor = COLORS.URL;
          break;
        case 'file':
          text = _.last(item.uri.split("/"));
          backgroundColor = COLORS.FILE;
          break;
      }

      return (
        <div
          className='card'
          key={key}
          style={{...styles.suggestion, backgroundColor}}>
          <div style={styles.title}>
            <div style={{flex: '0 0 30px', textAlign: 'center'}}><File /></div>
            <div style={{flex: '1 1 auto', margin: '10px 10px 5px 0', fontSize: 18}}>
              <a href={item.url}>{item.title || item.url}</a>
            </div>
          </div>
          <div style={styles.text}>
            <div style={styles.buttons}>
              <div style={{flex: '1', textAlign: 'center'}}>Click for Fun!</div>
              <div style={{flex: '1', textAlign: 'center'}}><ThumbsUp /></div>
              <div style={{flex: '1', textAlign: 'center'}}><ThumbsDown /></div>
            </div>
            <p>
              <a href={item.url} target="_blank">
                {text}
              </a>
            </p>
          </div>
        </div>
      );
    });

    return (
      <div style={{width: '100%', height: '100%'}}>
        <div style={styles.cardList}>{childElements}</div>
        <pre>{JSON.stringify(this.props.items, null, 2)}</pre>
      </div>
    )
  }
}

let buttonStyles = {}


export default Radium(Feedback);


function combineStyles(...args) {
  let validArgs = args.filter(arg => arg && arg.constructor === Object)
  let ret = {};

  while (validArgs.length > 0) {
    ret = {...ret, ...validArgs.shift()};
  }

  return ret;
}
