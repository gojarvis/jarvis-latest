import React from 'react';
import Radium from 'radium';
import EventTickerItem from './EventTickerItem';

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
    return (
      <div style={this.props.style}>
        {this.props.items.map((item, index) => {
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
        })}
      </div>
    );
  }
}

export default EventTickerList;
