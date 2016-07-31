import React from 'react';
import File from 'components/Icons/File';
import Browser from 'components/Icons/Browser';
import IconText from 'components/IconText';
import LinearProgress from 'material-ui/lib/linear-progress';
import FB from 'styles/flexbox';

class QueriedItem extends React.Component {
  render() {
    let {item} = this.props;

    let color = "rgba(255, 255, 255, " + item.relationshipWeight + ")";
    let title = item.endNode.address ?
      item.endNode.address.split('/').filter((item) => item !== "").slice(-1).pop() :
      item.endNode.title || '<No Title or Address>';

    let iconClass, typeIconColor;
    switch(item.endNode.type) {
      case 'file':
        iconClass = 'file';
        typeIconColor = '#FF3F81';
        break;
      case 'url':
        iconClass = 'bookmark';
        typeIconColor = '#00BBD5';
        break;
      default:
        typeIconColor = '#000';
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
    let weightBar = item.relationshipWeight * 10 * 20;
    let weightBarString = weightBar + "vw"

    return (
      <div
        title={JSON.stringify(item, null, 2)}
        style={{..._styles.container, backgroundColor: color}}
        onClick={() => this.props.onClick(nodeId)}>
        <IconText icon={iconClass} iconColor={typeIconColor}>
          <IconText icon={openWithClass} iconColor={iconColor}>
            <div style={{...FB.base, flexWrap: "nowrap", ...FB.align.center}}>
              <div style={{flexGrow: "4", marginRight: "40px", overflow: "hidden", whiteSpace: "nowrap" }}>{title.slice(0, 20)}</div>
              <div style={{width: '15vw'}}><LinearProgress mode="determinate" value={item.relationshipWeight * 100} /></div>
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
    cursor: "pointer",
    borderRadius: 4,
  }
}

export default QueriedItem;
