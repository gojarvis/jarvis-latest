import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import EventTickerItem from './EventTickerItem';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import FlipMove from 'react-flip-move';
import FB from 'styles/flexbox';
require('./EventTicker.css');

class EventTickerList extends Component {
  constructor(...args) {
    super(...args);
  }

  _itemOnClick(nodeId) {
    this.props.fetchQueryItemsIfNeeded(nodeId);
  }

  static propTypes = {
    items: PropTypes.object.isRequired
  };

  static displayName = 'EventTickerList';

  _renderItems() {
    let items;
    if (this.props.items.size > 0) {
      items = this.props.items.take(7).map((item, index) => {
        let color = "rgba(80, 195, 210, 0.67)" ;

        if (index === 0) {
          color = "green"
        } else {
          let opacity = (100 - index * 9.90) / 100;
          color = "rgba(80, 195, 210, " + opacity + ")" ;
        }

        return (
          <EventTickerItem
            key={index}
            item={item}
            index={index}
            onClick={this._itemOnClick.bind(this)} />
        )
      });
    } else {
      items = <Card zDepth={4} style={{margin: "10px 0 10px 10px", flexShrink: 0,}}>
         <CardText style={{...FB.base, flexDirection: 'column', display: "flex", justifyContent: "space-between"}}>
           <div style={{fontSize: "14px"}}>Waiting...</div>
         </CardText>
       </Card>
    }

    return items;
  }

  render() {
    return (
      <div style={styles.eventTickerList} className='eventTickerList'>
        <FlipMove enterAnimation="accordianHorizontal" leaveAnimation="accordianHorizontal" style={{...FB.base, flexDirection: 'row'}}>
          {this._renderItems()}
        </FlipMove>
      </div>
    );
  }
}

const styles = {
  eventTickerList: {
    ...FB.base,
    ...FB.justify.start,
    ...FB.align.stretch,
    // minHeight: 140,
    overflowY: "hidden",
    overflowX: "scroll",
  },
}

export default EventTickerList;
