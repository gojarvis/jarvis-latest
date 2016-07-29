import React from 'react';

class EventTickerItem extends React.Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    let title = this.props.item.data.title ?
      this.props.item.data.title.split('/').filter(function(item) { return item !== "" }).slice(-1).pop() :
      this.props.item.source;
    return (
      <div
        onClick={() => this.props.onClick(this.props.item.data.nodeId)}
        style={this.props.style}>
        <div target="{this.props.item.address}">{title}</div>
        <div style={{fontSize: "8px"}} nodeId={this.props.item.data.nodeId}>{this.props.item.data.nodeId}</div>
      </div>
    );
  }
}

export default EventTickerItem;
