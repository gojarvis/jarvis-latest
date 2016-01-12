import React from 'react';
import imm from 'immutable';
import Card from './Card';
import UrlCard from './UrlCard';
import FileCard from './FileCard';

export default class CardList extends React.Component {
  static get defaultProps() {
    return {
      list: imm.List()
    }
  }

  render() {
    return (
      <div className={`card-list ${this.props.name}`}>
        <h3>{this.props.name}</h3>
        {this.props.list.map(item => {
          return <Card model={item} />
        })}
      </div>
    );
  }
}
