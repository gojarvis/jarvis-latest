import React from 'react';
import Radium, { Style } from 'radium';
import imm from 'immutable';
import { STYLES, COLORS } from '../styles';

export default class FileCard extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {};
  }

  render() {
    // let item = imm.fromJS(this.props.model);
    let item = this.props.model;
    let map = imm.Map(item);

    let title = imm.List(item.uri.replace(/\//g, ' ').split(' ')).last();

    return (
      <div className='card file'>
        <Style rules={STYLES.Card} />

        <div className="title">
          <div className="title-pad">File: {title}</div>
        </div>

        <div className='content'>
          <table>
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
  }
}
