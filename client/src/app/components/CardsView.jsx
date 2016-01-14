import React, { PropTypes } from 'react';
import Radium, { Style } from 'radium';
import imm from 'immutable';
import {VictoryAnimation} from 'victory-animation';
import Card from './Card';
import UrlCard from './UrlCard';
import FileCard from './FileCard';
import CardList from './CardList';
import BaseComponent from './_BaseComponent';

export default class CardsView extends BaseComponent {
  constructor(...args) {
    super(...args);

    this._mapItem = this._mapItem.bind(this);
    this._moveLeft = this._moveLeft.bind(this);
    this._moveRight = this._moveRight.bind(this);
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

  _showList() {}

  _hideList() {}

  _moveLeft() {}

  _moveRight() {}

  render() {
    return (
      <div>
        <Style rules={styles} />
        <div className="card-view">
          <div className="button left" onClick={this._moveLeft}>&lt;</div>

          <div className='middle'>
            <VictoryAnimation data={this.props.animation.listStyles.social}>
              {(data) => {
                return (
                  <CardList
                    style={{...data}}
                    list={this.props.lists.get('social', imm.List())}
                    name='Social Recommendations'
                    type='file' />
                );
              }}
            </VictoryAnimation>
            <VictoryAnimation data={this.props.animation.listStyles.urls}>
              {(data) => {
                return (
                  <CardList
                    style={{...data}}
                    list={this.props.lists.get('urls', imm.List())}
                    name='Urls'
                    type='url' />
                );
              }}
            </VictoryAnimation>
            <VictoryAnimation data={this.props.animation.listStyles.files}>
              {(data) => {
                return (
                  <CardList
                    style={{...data}}
                    list={this.props.lists.get('files', imm.List())}
                    name='Files'
                    type='file' />
                );
              }}
            </VictoryAnimation>
          </div>

          <div className="button right" onClick={this._moveRight}>&gt;</div>
        </div>
      </div>
    )
  }
}

const SHOW = {
  opacity: 1
};

const HIDE = {
  opacity: 0
};

let styles = {
  '.card-view': {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    height: '80vh'
  },
  '.card-list': {
    flex: '1',
    position: 'absolute',
    width: '100%',
  },
  '.button': {
    fontSize: 42,
    textAlign: 'center'
  },
  '.left': {
    flex: '1'
  },
  '.right': {
    flex: '1'
  },
  '.middle': {
    flex: '1 1 80vw',
    position: 'relative',
    height: '80vh'
  },
  '.card-title': {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    fontSize: 22,
    borderBottom: '1px solid black',
    maxWidth: '100%'
  },
  '.card': {
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
  '.card-text': {
    margin: 10,
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
  },
}
