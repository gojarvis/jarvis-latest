import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import {File, Browser, Terminal} from '../Icons';
import IconText from 'components/IconText';
import FB from 'styles/flexbox';
let agent = require('superagent-promise')(require('superagent'), Promise);

import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';
import moment from 'moment';

class EventTickerItem extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      expanded: false,
    };
  }

  static get propTypes() {
    return {
      item: PropTypes.object.isRequired
    }
  }

  handleExpandChange = (expanded) => {
    this.setState({expanded: expanded});
  };

  handleToggle = (event, toggle) => {
    this.setState({expanded: toggle});
  };

  handleExpand = () => {
    this.setState({expanded: true});
  };

  handleReduce = () => {
    this.setState({expanded: false});
  };

  // async externalLinkClick(address, type){
  //   let params = {
  //     address : address,
  //     type: type
  //   };
  //   let result = await agent.post('http://localhost:3000/open', params);
  // }

  render() {

    let item = this.props.item;
    let iconClass, iconColor;
    switch(item.source) {
      case 'atom':
        iconClass = 'file';
        iconColor = '#FF3F81';
        break;
      case 'chrome':
        iconClass = 'bookmark';
        iconColor = '#00BBD5';
        break;
      case 'terminal':
        iconClass = 'desktop';
        iconColor = '#2dd500';
        break;
    }

    let title = this.props.item.data.title ?
      this.props.item.data.title.split('/').filter(item => item !== '').slice(-1).pop() :
      this.props.item.data.address ?
        this.props.item.data.address.split('/').filter(item => item !== '').slice(-1).pop() :
        this.props.item.source;


    let momentText = moment(item.timestamp).fromNow();

    return (
      <div
        className='eventTickerItem'
        title={JSON.stringify(item, null, 1)}
        style={STYLES.container}
        onClick={() => this.props.onClick(this.props.item.data.nodeId)}>
        {/* <IconText icon='external-link' onClick={() => externalLinkClick(item.address, item.type)} style={{cursor: 'pointer'}} /> */}
        <div style={STYLES.row}>
          <IconText icon={iconClass} style={{marginRight: 10}} iconColor={iconColor} />
          <span style={STYLES.title}>{title.slice(0,35)}{title.length > 35 ? '...' : ''}</span>
        </div>
        <div style={STYLES.subtitle}>{momentText}</div>
      </div>
    );
  }
}

const STYLES = {
  container: {
    ...FB.base,
    ...FB.justify.center,
    ...FB.align.end,
    borderRadius: 4,
    cursor: 'pointer',
    margin: "10px 0 10px 10px",
    flexShrink: 0,
    backgroundColor: '#fff',
    padding: 10,
    color: '#000',
    flexDirection: 'column',
    minWidth: 100
  },
  row: {
    ...FB.base,
    ...FB.justify.center,
    ...FB.align.center,
    alignSelf: 'flex-start'
  },
  title: {
    fontSize: 18
  },
  subtitle: {
    fontSize: 11
  },
}

export default EventTickerItem;
