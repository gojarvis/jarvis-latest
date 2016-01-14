import React from 'react';
import Radium, { Style } from 'radium';
import imm from 'immutable';
import { STYLES, COLORS } from '../styles';
import { VictoryAnimation } from 'victory-animation';

export default class Card extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      animationData: {
        opacity: '0.5'
      }
    };
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
      <VictoryAnimation data={this.state.animationData}>
        {(data) => {
          return (
            <div className='card' style={{...data, backgroundColor}}>
              <div className='card-title'>
                <div style={{margin: '10px 10px 5px', fontSize: 18}}>{item.get('title') || 'Title!'}</div>
              </div>
              <div className='card-text'>
                <a href={item.url} target="_blank">
                  {text}
                </a>
              </div>

              <div className='content'>
                <table className='padded-table'>
                  {map.map((value, key) => {
                    return (
                      <tr>
                        <td>{key}</td>
                        <td>{value}</td>
                      </tr>
                    )
                  })}
                </table>
              </div>
            </div>
          )
        }}
      </VictoryAnimation>
    )
  }
}
