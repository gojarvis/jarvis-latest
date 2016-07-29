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

    let iconColor;
    switch(item.relationshipType){
      case 'openwith':
        iconColor = 'rgb(210, 126, 33)';
        break;
      case 'touched':
        iconColor = 'rgb(33, 174, 210)';
        break;
      case 'related':
        iconColor = 'rgb(202, 33, 210)';
        break;
    }

    let nodeId = item.endNode.id;

    let openWithClass;
    switch (item.relationshipType) {
      case 'openwith':
        openWithClass = 'folder-open';
        break;
      case 'touched':
        openWithClass = 'hand-pointer-o';
        break;
      default:
        openWithClass = '';
        break;
    }
    let weightBar = item.relationshipWeight * 10 * 60;
    let weightBarString = weightBar + "vw"

    return (
      <div
        title={JSON.stringify(item, null, 2)}
        style={{..._styles.container, backgroundColor: color}}
        onClick={() => this.props.onClick(nodeId)}>
        <IconText icon={iconClass}>
          <IconText icon={openWithClass} iconColor={iconColor}>
            <div style={{display: "flex", flexWrap: "nowrap"}}>
              <div style={{alignSelf: "flex-start", flexGrow: "4", marginRight: "40px" }}>{title.slice(0, 35)}</div>
              <div style={{alignSelf: "flex-end", backgroundColor: "rgb(187, 187, 187)", width: "60vh", display: "inline-block"}}>
                <span style={{width: weightBar, backgroundColor: "rgba(6, 150, 38, 0.8)", display: "inline-block", height: "8px"}}></span>
              </div>
            </div>
          </IconText>
        </IconText>
      </div>
    )
  }
}

const _styles = {
  container: {
    color: 'rgba(0, 0, 0, 1)',
    padding: 5,
    margin: 10,
    cursor: "pointer"
  }
}

export default QueriedItem;
