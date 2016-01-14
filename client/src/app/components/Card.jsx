import React from 'react';
import Radium, { Style } from 'radium';
import imm from 'immutable';
import { STYLES, COLORS } from '../styles';
import { VictoryAnimation } from 'victory-animation';

const HIDDEN = {
  opacity: 0
}
const SHOWN = {
  opacity: 1
}

export default class Card extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      animation: {...HIDDEN}
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        animation: {...SHOWN}
      })
    }, 1000)
  }

  componentWillUnmount() {
    this.setState({
      animation: {...HIDDEN}
    })
  }

  render() {
    let item = this.props.model;
    let map = imm.fromJS(item);

    let text = '';
    let backgroundColor = 'rgba(10, 0, 255, 0.5)';
    switch(item.type){
      case 'url':
        text = item.get('url');
        backgroundColor = COLORS.URL;
        break;
      case 'file':
        text = _.last(item.get('uri').split("/"));
        backgroundColor = COLORS.FILE;
        break;
      default:
        text = '<empty text>';
        backgroundColor = item.get('url', false) ? COLORS.URL : COLORS.FILE
        break;
    }

    return (
      <VictoryAnimation data={this.state.animation}>
        {(data) => {
          return (
            <div className='card' style={{...styles.suggestion, backgroundColor, ...data}}>
              <div style={styles.title}>
                <div style={{margin: '10px 10px 5px', fontSize: 18}}>{item.get('title') || 'Title!'}</div>
              </div>
              <div style={styles.text}>
                <a href={item.url} target="_blank">
                  {text}
                </a>
              </div>

              <div className='content'>
                <table className='padded-table'>
                  <tbody>
                    {map.map((value, key) => {
                      return (
                        <tr key={key}>
                          <td>{key}</td>
                          <td>{value}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }}
      </VictoryAnimation>
    )
  }
}

const styles = {
  title: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    fontSize: 22,
    borderBottom: '1px solid black',
    maxWidth: '100%'
  },
  suggestion: {
    fontFamily: 'Montserrat',
    fontWeight: 400,
    boxShadow: `1px 2px 9px rgba(0,0,0,0.5)`,
    opacity: `1`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    margin: 10
  },
  text: {
    margin: 10,
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
  }
}
