import React from 'react';
import File from '../Icons/File';
import Browser from '../Icons/Browser';

class EventTickerItem extends React.Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    let title = this.props.item.data.title ?
      this.props.item.data.title.split('/').filter(function(item) { return item !== "" }).slice(-1).pop() :
      this.props.item.data.address ?
        this.props.item.data.address.split('/').filter(function(item) { return item !== "" }).slice(-1).pop() :
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
    return (
      <div
        onClick={() => this.props.onClick(this.props.item.data.nodeId)}
        style={this.props.style}
        title={JSON.stringify(this.props.item, null, 2)}>
        <div target="{this.props.item.address}">{icon}&nbsp;{title}</div>
        <div style={{fontSize: 10}} nodeId={this.props.item.data.nodeId}>{this.props.item.data.nodeId}</div>
      </div>
    );
  }
}

export default EventTickerItem;
