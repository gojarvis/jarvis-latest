import React from 'react';
import Radium, { Style } from 'radium';
import imm from 'immutable';
import Card from './Card';
import UrlCard from './UrlCard';
import FileCard from './FileCard';
import CardList from './CardList';

export default class CardsView extends React.Component {
  constructor(...args) {
    super(...args);

    this._mapItem = this._mapItem.bind(this);
  }

  static get defaultProps() {
    return {
      lists: imm.Map()
    }
  }

  _mapItem(item) {
    return (
      <Card item={item} />
    )
  }

  render() {
    return (
      <div style={{margin: 10}}>
        <Style rules={styles} />
        <div className="card-view">
          <CardList
            list={this.props.lists.get('social', imm.List())}
            name='Social Recommendations'
            type='file' />
          <CardList
            list={this.props.lists.get('urls', imm.List())}
            name='Urls'
            type='url' />
          <CardList
            list={this.props.lists.get('files', imm.List())}
            name='Files'
            type='file' />
        </div>
      </div>
    )
  }
}

let styles = {
  '.card-view': {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  '.card-list': {
    flex: '1',
    minWidth: 400
  }
}
