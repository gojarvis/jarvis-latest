import React from 'react';
import {File, Browser} from '../Icons';
import IconText from 'components/IconText';
import FB from 'styles/flexbox';

import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/lib/card';
import FlatButton from 'material-ui/lib/flat-button';
import Toggle from 'material-ui/lib/toggle';
import moment from 'moment';

class EventTickerItem extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      expanded: false,
    };
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
    }


    let title = this.props.item.data.title ?
      this.props.item.data.title.split('/').filter(item => item !== '').slice(-1).pop() :
      this.props.item.data.address ?
        this.props.item.data.address.split('/').filter(item => item !== '').slice(-1).pop() :
        this.props.item.source;
    let icon;
    switch(this.props.item.source) {
      case 'chrome':
        icon = <Browser />;
        break;
      case 'atom':
        icon = <File />;
        break;
    }

    let momentText = moment(this.props.item.timestamp).fromNow();
    console.log(this.props.item.timestamp);


    return (
      <div>
        <div style={{...this.props.style, ...STYLES.container}} onClick={() => this.props.onClick(this.props.item.data.nodeId)}>
          <Card zDepth={4} style={{height: "120px", minWidth: "220px"}}>
             <CardText style={{...FB.base, flexDirection: 'column', display: "flex", justifyContent: "space-between"}}>
               <div style={STYLES.title}>{title.slice(0,35)}</div>
               <div style={{...FB.base, fontSize: "12px", alignSelf: "stretch", marginBottom: 0}}>
                 <div style={{marginRight: "5px"}}><span className={'fa fa-lg fa-' + iconClass} style={{marginRight: 15, fontSize: "13px", color: iconColor}} />{item.source} |</div>
                 <div style={{color: "grey"}}>{momentText}</div>
               </div>
             </CardText>
           </Card>
        </div>
      </div>
    );
  }
}

const STYLES = {
  container: {
    ...FB.base,
    ...FB.justify.center,
    ...FB.align.center,
    borderRadius: 4,
    cursor: 'pointer',
    margin: '5px',
  },
  title: {
    fontSize: 20,
    alignSelf: "flex-start"
  },
}

export default EventTickerItem;
