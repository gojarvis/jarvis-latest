import React, { PropTypes } from 'react';
import File from 'components/Icons/File';
import Browser from 'components/Icons/Browser';
import IconText from 'components/IconText';
import LinearProgress from 'material-ui/LinearProgress';
import FB from 'styles/flexbox';
let agent = require('superagent-promise')(require('superagent'), Promise);

class QueriedItem extends React.Component {
  constructor(...args) {
    super(...args);

    this._blacklistNode = this._blacklistNode.bind(this);
  }

  static get propTypes() {
    return {
      item: PropTypes.object.isRequired,
      onClick: PropTypes.func.isRequired,
    }
  }

  async _blacklistNode(targetId, e) {
    // console.log('blacklisting: ', targetId);
    let result = await agent.post('/blacklist', {
      userId: window.localStorage.getItem('userId'),
      targetId
    });
    // console.log('blacklist result: ', result.body);
  }

  render() {
    let {item} = this.props;
    let weight = item.relationshipWeight > 1 ? 100 : parseInt(item.relationshipWeight * 100);


    let title;
    let {endNode} = item;
    switch (endNode.type) {
      case 'file':
        let addr = endNode.address.split('/');
        title = '../' + addr.slice(Math.max(addr.length - 3, 1)).join('/');
        break;
      case 'url':
        title = endNode.title;
        if (title.length === 0){
          title = endNode.address.split('/').filter((item) => item !== "").slice(-1).pop().slice(0, 20);
        }
        break;
      case 'keyword':
        title = endNode.text
        break;
      case 'command':
        title = endNode.address
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
      case 'command':
          iconClass = 'desktop';
          typeIconColor = '#2dd500';
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
    let weightValue, maxValue, engagementLabel, opacity, raw;

    if (item.relationshipWeight / item.avgOpen > 1){
      raw = item.relationshipWeight.toFixed(3);
      maxValue = item.maxOpen.toFixed(3);
      weightValue = (item.relationshipWeight / maxValue * 100).toFixed(3);
      engagementLabel = 'high';
    }
    else{
      if (item.relationshipWeight > 0){
        maxValue = item.avgOpen.toFixed(3);
        raw = item.relationshipWeight.toFixed(3);
        weightValue = (Math.log10(item.relationshipWeight / maxValue * 100) * 10).toFixed(3);
        engagementLabel = 'low';
      }
      else{
        weightValue = 0;
        maxValue = item.avgOpen.toFixed(3);
        engagementLabel = 'none';
      }
    }



    let color = "hsla(" + weightValue +", 70%, 60%, 0.8)";

    return (
      <div
        title={JSON.stringify(item, null, 2)}
        style={{..._styles.container, backgroundColor: "white", borderColor: color, borderRight: "15px solid " + color, borderLeft: "15px solid " + color}}
        onClick={() => this.props.onClick(nodeId)}>
        <IconText icon={iconClass} iconColor={typeIconColor}>
          <IconText icon={openWithClass} iconColor={iconColor}>
            <div style={{...FB.base, flexWrap: "nowrap", ...FB.align.center}}>
              <div style={{flexGrow: "4", marginRight: "40px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", width: "10px" }}>{title}</div>
              <div style={{width: '10vw', marginRight: "2vw"}}>
                <LinearProgress mode="determinate" value={weightValue}/>

                <div style={{'fontSize': 10, 'marginTop': 7}}>
                  {engagementLabel} {weightValue} {maxValue} {raw}
                </div>
              </div>
              <IconText icon='trash' onClick={(e) => this._blacklistNode(nodeId, e)} />
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
