import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import IconText from 'components/IconText';
import _ from 'lodash';
let agent = require('superagent-promise')(require('superagent'), Promise);

async function externalLinkClick(address, type){
  let params = {
    address : address,
    type: type
  };
  let result = await agent.post('http://localhost:3000/open', params);
}

function FocusedItem(props) {
  let {item} = props;
  if (_.isUndefined(item)){
    console.log('No items');
    return <div></div>
  }

  let iconClass, iconColor;
  switch(item.get('type')) {
    case 'file':
      iconClass = 'file';
      iconColor = '#FF3F81';
      break;
    case 'url':
      iconClass = 'bookmark';
      iconColor = '#00BBD5';
      break;
  }

  let isVisible = item.size === 0 ? { display: 'none' } : {};

  return (
    <Card style={{...isVisible, ...styles.focusedItem}} title={JSON.stringify(props, null, 2)}>
      <IconText icon={iconClass} iconColor={iconColor}>
        {(item.get('title', '') || item.get('address', '') || '')
          .split('/')
          .filter(part => part !== '')
          .slice(-1).pop()}
      </IconText>
      <IconText icon='external-link'>
        <span
          style={{cursor: 'pointer'}}
          onClick={() => externalLinkClick(item.get('address'), item.get('type'))}>
          {item.get('address')}
        </span>
      </IconText>
    </Card>
  );
}

const styles = {
  focusedItem: {
    margin: "10px",
    padding: "10px",
    color: "black",
  },
}

export default FocusedItem;
