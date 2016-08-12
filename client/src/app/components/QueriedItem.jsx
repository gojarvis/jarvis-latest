import React from 'react';
import File from 'components/Icons/File';
import Browser from 'components/Icons/Browser';
import IconText from 'components/IconText';
import LinearProgress from 'material-ui/LinearProgress';
import FB from 'styles/flexbox';

class QueriedItem extends React.Component {
  render() {
    let {item} = this.props;
    console.info('queriedItem', item);
    // let color = "rgba(255, 255, 255, " + item.relationshipWeight + ")";
    let color = "hsla(" + parseInt(item.relationshipWeight * 100) +", 100%, 50%, 1)";
    // let title = item.endNode.address ?
    //   item.endNode.address.split('/').filter((item) => item !== "").slice(-1).pop() :
    //   item.endNode.title ? item.endNode.title :
    //     item.endNode.text ? item.endNode.text  : 'No title or address'

    let title;
    let {endNode} = item;
    switch (endNode.type) {
      case 'file':
        let addr = endNode.address.split('/');
        title = '../' + addr.slice(Math.max(addr.length - 3, 1)).join('/');
        break;
      case 'url':
        title = endNode.address.split('/').filter((item) => item !== "").slice(-1).pop().slice(0, 20);
        break;
      case 'keyword':
        title = endNode.text
        break;
      default:
        break;
    }

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

      case 'keyword':
        iconClass = 'aspect-ratio';
        typeIconColor = '#607D8B';
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
        style={{..._styles.container, backgroundColor: "white", borderColor: color, borderRight: "15px solid " + color, borderLeft: "15px solid " + color}}
        onClick={() => this.props.onClick(nodeId)}>
        <IconText icon={iconClass} iconColor={typeIconColor}>
          <IconText icon={openWithClass} iconColor={iconColor}>
            <div style={{...FB.base, flexWrap: "nowrap", ...FB.align.center}}>
              <div style={{flexGrow: "4", marginRight: "40px", overflow: "hidden", whiteSpace: "nowrap" }}>{title}</div>
              <div style={{width: '25vw', marginRight: "2vw"}}><LinearProgress mode="determinate" value={item.relationshipWeight * 100} /></div>
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
