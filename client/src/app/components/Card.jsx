import React from 'react';
import Radium, { Styles } from 'radium';
import imm from 'immutable';
import { STYLES, COLORS } from '../styles';

export default class Card extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {};
  }

  render() {
    let item = this.props.item;

    let text = '';
    let backgroundColor = 'rgba(10, 0, 255, 0.5)';
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
      <div style={{...styles.suggestion, backgroundColor}}>
        <div style={styles.title}>
          <div style={{margin: '10px 10px 5px', fontSize: 18}}>{item.title || 'Title!'}</div>
        </div>
        <div style={styles.text}>
          <a href={item.url} target="_blank">
            {text}
          </a>
        </div>
      </div>
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
