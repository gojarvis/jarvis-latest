import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import {File, Browser, Terminal} from '../Icons';
import IconText from 'components/IconText';
import FB from 'styles/flexbox';
let agent = require('superagent-promise')(require('superagent'), Promise);
import imm from 'immutable';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';
import moment from 'moment';

class ContextViewerItem extends React.Component {
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


    if (imm.Map.isMap(this.props.item)){
      item = this.props.item.toJS();
    }
    else{
      item = this.props.item;
    }


    switch(item.data.type) {
      case 'file':
        iconClass = 'file';
        iconColor = '#FF3F81';
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


    console.log(item.count);
    let title = item.data.title ?
        item.data.title.split('/').filter(char => char !== '').slice(-1).pop() :
        item.data.address ?
          item.data.address.split('/').filter(char => char !== '').slice(-1).pop() :
          item.source;

    let descriptionText;
    switch(item.count){
      case 0:
        descriptionText = ``;
      break;
      case 1:
        descriptionText = `Item accessed once`;
      break;
      case 2:
        descriptionText = `Item accessed twice`;
      break;
      default:
      descriptionText = `Item accessed ${item.count} times`;
      break;
    }


    let momentText = moment(item.timestamp).fromNow();

    return (
      <div
        className='contextViewerItem'
        title={JSON.stringify(item, null, 1)}
        style={STYLES.container}
        onClick={() => this.props.onClick(this.props.item.data.nodeId)}>
        <div style={STYLES.row}>
          <IconText icon={iconClass} style={{marginRight: 10}} iconColor={iconColor} />
          <span style={STYLES.title}>{title.slice(0,35)}{title.length > 35 ? '...' : ''}</span>
        </div>
        <div style={STYLES.subtitle}>{descriptionText}</div>
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

export default ContextViewerItem;
