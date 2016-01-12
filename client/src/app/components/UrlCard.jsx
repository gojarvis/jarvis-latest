import React from 'react';
import Radium, { Style } from 'radium';
import imm from 'immutable';
import { STYLES, COLORS } from '../styles';

export default class UrlCard extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {};
  }

  render() {
    let item = this.props.model;
    let map = imm.Map(item);

    return (
      <div className='card url'>
        <Style rules={STYLES.Card} />

        <div className="title">
          <div className="title-pad">URL: {item.title || 'Title needs fetching...'}</div>
        </div>

        <div className="content">
          <table>
            {map.map((value, key) => {
              if (key === 'url') {
                value = <a href={value} target="_blank">{value}</a>
              }

              return (
                <tr>
                  <td style={{marginRight: 10}}>{key}</td>
                  <td>{value}</td>
                </tr>
              )
            })}
          </table>
        </div>
      </div>
    )
  }
}
