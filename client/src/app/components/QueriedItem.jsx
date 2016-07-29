import React from 'react';
import File from './Icons/File';
import Browser from './Icons/Browser';

class QueriedItem extends React.Component {
  render() {
    let {item} = this.props;

    let color = "rgba(255, 255, 255, " + item.relationshipWeight + ")";
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

    let labelColor;
    switch(item.relationshipType){
      'openwith':
        labelColor = 'rgb(210, 126, 33)';
        break;
      'touched':
        labelColor = 'rgb(33, 174, 210)';
        break;
      'related':
        labelColor = 'rgb(202, 33, 210)';
        break;
    }

    let nodeId = item.endNode.id;
    return (
      <div
        title={JSON.stringify(item, null, 2)}
        style={{ backgroundColor: color, color: 'rgba(0, 0, 0, 1)', padding: "20px", margin: "10px"}}
        onClick={() => this.props.onClick(nodeId)}>
         <span>{icon}</span>
         <span style={{ width: "100px", backgroundColor: labelColor, padding: "10px" ,margin: "6px", color: "#fff", borderRadius: "5px"}}>{item.relationshipType}</span>
         <span>{title}</span>
      </div>
    )
  }
}

export default QueriedItem;
