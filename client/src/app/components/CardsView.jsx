import React from 'react';
import Radium, { Style } from 'radium';
import imm from 'immutable';
import Card from './Card';
import UrlCard from './UrlCard';
import FileCard from './FileCard';

export default class CardsView extends React.Component {
  constructor(...args) {
    super(...args);

    this._mapItem = this._mapItem.bind(this);
  }

  _mapItem(item) {
    return (
      <Card item={item} />
    )
  }

  render() {
    return (
      <div>
        <Style rules={styles} />
        <div className="card-view">
          <div className="urls">
            {this.props.urls.map(item => {
              return <UrlCard model={item} />
            })}
          </div>
          <div className="files">
            {this.props.files.map(item => {
              return <FileCard model={item} />
            })}
          </div>
        </div>
      </div>
    )
  }
}

let styles = {
  '.card-view': {
    display: 'flex'
  },
  '.urls, .files': {
    flex: '1'
  }
}
