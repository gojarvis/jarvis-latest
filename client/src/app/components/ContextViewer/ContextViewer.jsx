import React, { Component, PropTypes } from 'react';
import Radium from 'radium';
import ContextViewerItem from './ContextViewerItem';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import FlipMove from 'react-flip-move';
import FB from 'styles/flexbox';
require('./ContextViewer.css');

class ContextViewer extends Component {
  static displayName = 'ContextViewer';

  constructor(...args) {
    super(...args);
  }

  _itemOnClick(nodeId) {
    this.props.fetchQueryItemsIfNeeded(nodeId);
  }

  static propTypes = {
    items: PropTypes.object.isRequired
  };

  _renderItems() {
    let items;
    if (this.props.items.size > 0) {
      let max = 0;
      this.props.items.forEach((item) => {
        let i = item.toJS();
        if (max < i.count) {
          max = i.count;
        }
      });

      items = this.props.items.take(8).map((item, index) => {
        let i = item.toJS();
        let weight = (i.count / max) * 100;
        return (
          <ContextViewerItem
            key={index}
            item={item}
            index={index}
            weight={weight}
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
      <div style={{'background': 'rgb(40, 44, 52)'}}>
        <div style={{'background': 'rgb(40, 44, 52)', 'color': 'white', 'padding': '10' }}>Activity heatmap</div>
        <div style={styles.eventTickerList} className='eventTickerList'>
          <FlipMove enterAnimation="accordianHorizontal" leaveAnimation="accordianHorizontal" style={{...FB.base, flexDirection: 'row'}}>
            {this._renderItems()}
          </FlipMove>
        </div>
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
    background: "rgb(40, 44, 52)"
  },
}

export default ContextViewer;
