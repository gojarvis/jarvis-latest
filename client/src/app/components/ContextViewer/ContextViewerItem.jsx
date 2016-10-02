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

    let weight = this.props.weight;
    let color = `hsla(${weight}, 100%, 50%, ${weight/100})`;

    switch(item.data.type) {
      case 'file':
        iconClass = 'file';
        iconColor = `rgba(255, 63, 129, ${weight/100})`;
        break;
      case 'url':
        iconClass = 'bookmark';
        iconColor = `rgba(0, 187, 213, ${weight/100})`;
        break;
      case 'command':
        iconClass = 'desktop';
        iconColor = '#2dd500';
        break;
    }


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
        style={{...styles.container, 'borderLeft': "5px solid " + color}}
        onClick={() => this.props.onClick(this.props.item.data.nodeId)}>
        <div style={styles.row}>
          <IconText icon={iconClass} style={{marginRight: 10}} iconColor={iconColor} />
          <span style={styles.title}>{title.slice(0,35)}{title.length > 35 ? '...' : ''}</span>
        </div>
        <div style={styles.subtitle}>{descriptionText}</div>
      </div>
    );
  }
}



const styles = {
  container: {
    ...FB.base,
    ...FB.justify.center,
    ...FB.align.end,
    cursor: 'pointer',
    margin: "10px 0 10px 10px",
    flexShrink: 0,
    padding: 10,
    color: '#fff',
    // color: '#000',
    flexDirection: 'column',
    minWidth: 100,
    fontFamily: '"Lucida Grande", "Segoe UI", Ubuntu, Cantarell, sans-serif',
    backgroundColor: 'rgb(62, 66, 75)',
    // color: 'rgb(148, 157, 175)'
  },
  row: {
    ...FB.base,
    ...FB.justify.center,
    ...FB.align.center,
    alignSelf: 'flex-start',

  },
  title: {
    fontSize: 13
  },
  subtitle: {
    fontSize: 8
  },
}

export default ContextViewerItem;
