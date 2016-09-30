import { Component } from 'react';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import IconText from 'components/IconText';
import _ from 'lodash';
import imm from 'immutable';
let agent = require('superagent-promise')(require('superagent'), Promise);

async function externalLinkClick(address, type){
  let params = {
    address : address,
    type: type,
    timestamp: new Date()
  };
  let result = await agent.post('http://localhost:3000/open', params);
}

class FocusedItem extends Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    let {item} = this.props;
    if (_.isUndefined(item) || item === null){
      // console.log('No items');
      return <div></div>
    }

    let iconClass, iconColor;

    switch(item.get('type')) {
      case 'file':
        iconClass = 'file';
        iconColor = '#1e8935';
        break;
      case 'url':
        iconClass = 'bookmark';
        iconColor = '#00BBD5';
        break;
      case 'command':
        iconClass = 'desktop';
        iconColor = '#2dd500';
        break;
    }

    let isVisible = item.size === 0 ? { display: 'none' } : {};

    return (
      <div style={{...isVisible, ...styles.focusedItem}} className='focusedItem'>
        <IconText icon={iconClass} iconColor={iconColor} margin={10}>
          <span>
            {(item.get('title', '') || item.get('address', '') || '')
              .split('/')
              .filter(part => part !== '')
              .slice(-1).pop()}
          </span>

        </IconText>
        <IconText style={{cursor: 'pointer'}} icon='external-link' margin={10} onClick={() => externalLinkClick(item.get('address'), item.get('type'))}>
          <span>
            {item.get('address')}
          </span>
        </IconText>

      </div>
    );
  }
}

const styles = {
  focusedItem: {
    fontFamily: "'Lucida Grande', 'Segoe UI', Ubuntu, Cantarell, sans-serif",
    fontWeight: '700',
    backgroundColor: 'rgb(62, 66, 75)',
    fontSize: '12px',
    margin: "10px",
    padding: "10px",
    color: "rgb(148, 157, 175)",
  },
}

export default FocusedItem;
