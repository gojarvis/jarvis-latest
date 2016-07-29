import React from 'react';
import File from './Icons/File';
import Browser from './Icons/Browser';

class QueriedItem extends React.Component {
  render() {
    let {item} = this.props;

    let color = "rgba(80, 195, 210, " + item.relationshipWeight + ")";
    let title = item.endNode.address ?
      item.endNode.address.split('/').filter((item) => item !== "").slice(-1).pop() :
      item.endNode.title || '<No Title or Address>';

    let icon;
    switch(item.endNode.type) {
      case 'file':
        icon = <File />;
        break;
      case 'url':
        icon = <Browser />;
        break;
    }

    let nodeId = item.endNode.id;
    return (
      <div
        title={JSON.stringify(item, null, 2)}
        style={{ backgroundColor: color, color: '#fff', padding: "20px", margin: "10px"}}
        onClick={() => this.props.onClick(nodeId)}>
         {icon} {item.relationshipType} | {title} 
      </div>
    )
  }
}

export default QueriedItem;
