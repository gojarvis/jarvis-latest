import React from 'react';
import {File, Browser} from '../Icons';
import IconText from 'components/IconText';

class EventTickerItem extends React.Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    let item = this.props.item;
    let iconClass;
    switch(item.source) {
      case 'atom':
        iconClass = 'file-o';
        break;
      case 'chrome':
        iconClass = 'bookmark';
        break;
    }
    console.log(this.props);

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
    return (
      <div
        onClick={() => this.props.onClick(this.props.item.data.nodeId)}
        style={this.props.style}
        title={JSON.stringify(this.props.item, null, 2)}>
        <div target="{this.props.item.address}">
          <IconText icon={iconClass}>            
              {title.slice(0, 35)}
          </IconText>
        </div>
        <div style={{fontSize: 10}} nodeId={this.props.item.data.nodeId}>{this.props.item.data.nodeId}</div>
      </div>
    );
  }
}

export default EventTickerItem;
