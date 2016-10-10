import React, { PropTypes } from 'react';
import File from 'components/Icons/File';
import Browser from 'components/Icons/Browser';
import IconText from 'components/IconText';
import LinearProgress from 'material-ui/LinearProgress';
import FB from 'styles/flexbox';
let agent = require('superagent-promise')(require('superagent'), Promise);

let ThumbsUpIcon = require('react-icons/lib/fa/thumbs-o-up');
let ThumbsDownIcon = require('react-icons/lib/fa/thumbs-o-down');

async function externalLinkClick(address, type){
  let params = {
    address : address,
    type: type,
    timestamp: new Date()
  };
  let result = await agent.post('http://localhost:3000/open', params);
}

class QueriedItem extends React.Component {
  constructor(...args) {
    super(...args);

    this._blacklistNode = this._blacklistNode.bind(this);
  }

  static displayName = 'QueriedItem';

  static propTypes = {
    item: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
  }

  async _blacklistNode(targetId, e) {
    // console.log('blacklisting: ', targetId);
    let result = await agent.post('/blacklist', {
      userId: window.localStorage.getItem('userId'),
      targetId
    });
    // console.log('blacklist result: ', result.body);
  }

  async _sendFeedback(feedbackType, item){
    let result = await agent.post('/feedback', {
        userId: window.localStorage.getItem('userId'),
        feedbackType: feedbackType,
        startNode: item.startNode,
        endNode: item.endNode,
        relationshipType: item.relationshipType
    })
    
    this.props.onClick(item.startNode.id);

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
        typeIconColor = '#1e8935';
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
    let weightValue, maxValue, engagement, opacity, raw, engagementIconColor;
    if (item.relationshipWeight / item.avgOpen > 1){
      raw = item.relationshipWeight.toFixed(3);
      maxValue = item.maxOpen.toFixed(3);
      weightValue = (item.relationshipWeight / maxValue * 100).toFixed(3);
      engagement = 'wifi';
      engagementIconColor = 'green';
    }
    else{
      if (item.relationshipWeight > 0){
        maxValue = item.avgOpen.toFixed(3);
        raw = item.relationshipWeight.toFixed(3);
        weightValue = (Math.log10(item.relationshipWeight / maxValue * 100) * 10).toFixed(3);
        engagement = 'arrow-down';
        engagementIconColor = '#f19393';
      }
      else{
        weightValue = 0;
        maxValue = item.avgOpen.toFixed(3);

      }
    }


    let color = "hsla(" + weightValue +", 70%, 60%, 0.8)";



    return (
      <div
        title={JSON.stringify(item, null, 2)}
        style={{..._styles.card, borderLeft: "5px solid " + color }}
        >
        <IconText icon={iconClass} iconColor={typeIconColor}>

            <div style={{...FB.base, flexWrap: "nowrap", ...FB.align.center}}>
              <IconText icon='external-link'
                style={{ fontSize: 12 }}
                onClick={() => externalLinkClick(item.endNode.address, item.endNode.type)}
                ></IconText>
              <div onClick={() => this.props.onClick(nodeId)}
                style={{
                  flexGrow: "4",
                  fontSize: "12",
                  fontFamily: "'Lucida Grande', 'Segoe UI', Ubuntu, Cantarell, sans-serif",
                  marginRight: "40px",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  marginLeft: "10",
                  width: "10px" }}>
                    {title}
                </div>

                <div style={{'fontSize': 8, 'marginRight': 4}}>
                  <IconText icon={engagement} iconColor={engagementIconColor} />
                </div>

              <div style={{marginRight: 4, marginLeft: 4}}>
                <ThumbsDownIcon onClick={ () => this._sendFeedback('negative', item)}/>
              </div>
              <div style={{marginRight: 4, marginLeft: 4}}>
                <ThumbsUpIcon onClick={ () => this._sendFeedback('positive', item)}/>
              </div>

            </div>
          </IconText>

      </div>
    )
  }
}

const _styles = {
  card: {
    // color: "#949daf",
    color: '#fff',
    backgroundColor: "rgb(62, 66, 75)",
    padding: 5,
    margin: 10,
    cursor: "pointer",
    borderRadius: 0
  }
}

export default QueriedItem;
