import React from 'react';
import File from 'components/Icons/File';
import Browser from 'components/Icons/Browser';
import IconText from 'components/IconText';

class QueriedItem extends React.Component {
  render() {
    let {item} = this.props;

    let color = "rgba(255, 255, 255, " + item.relationshipWeight + ")";
    let title = item.endNode.address ?
      item.endNode.address.split('/').filter((item) => item !== "").slice(-1).pop() :
      item.endNode.title || '<No Title or Address>';

    let iconClass;
    switch(item.endNode.type) {
      case 'file':
        iconClass = 'file-o';
        break;
      case 'url':
        iconClass = 'bookmark';
        break;
    }

    let labelColor;
    switch(item.relationshipType){
      case 'openwith':
        labelColor = 'rgb(210, 126, 33)';
        break;
      case 'touched':
        labelColor = 'rgb(33, 174, 210)';
        break;
      case 'related':
        labelColor = 'rgb(202, 33, 210)';
        break;
    }

    let nodeId = item.endNode.id;
    return (
      <div
        title={JSON.stringify(item, null, 2)}
        style={{ backgroundColor: color, color: 'rgba(0, 0, 0, 1)', padding: "20px", margin: "10px"}}
        onClick={() => this.props.onClick(nodeId)}>
        <IconText icon={iconClass}>
          <span style={{ width: "100px", backgroundColor: labelColor, padding: "10px" ,margin: "6px", color: "#fff", borderRadius: "5px"}}>{item.relationshipType}</span>
          <span>{title.slice(0, 35)}</span>
        </IconText>
      </div>
    )
  }
}

export default QueriedItem;
