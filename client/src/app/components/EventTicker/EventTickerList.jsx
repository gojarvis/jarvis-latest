import React from 'react';
import Radium from 'radium';
import EventTickerItem from './EventTickerItem';
import CSSTransitionGroup from 'react-addons-css-transition-group';
require('./EventTicker.css');

class EventTickerList extends React.Component {
  constructor(...args) {
    super(...args);
  }

  static get defaultProps() {
    return {
      items: [],
      style: {},
    }
  }

  render() {
    let items = this.props.items.map((item, index) => {
      let color = "rgba(80, 195, 210, 0.67)" ;

      if (index === 0) {
        color = "green"
      }
      else{
        let opacity = (100 - index * 9.90) / 100;
        color = "rgba(80, 195, 210, " + opacity + ")" ;
      }

      return (
        <EventTickerItem
          key={index}
          item={item}
          index={index}
          onClick={this.props.itemOnClick}
          style={{...this.props.itemStyle, backgroundColor: "grey"}} />
      )
    });

    return (
      <div style={this.props.style}>
        <CSSTransitionGroup
          transitionName='example'
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}
          component='div'
          style={{display: 'flex'}}
          className='event-ticker-list'>
          {items}
        </CSSTransitionGroup>
      </div>
    );
  }
}

export default EventTickerList;
