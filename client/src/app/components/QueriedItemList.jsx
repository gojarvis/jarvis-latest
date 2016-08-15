import { PropTypes } from 'react';
import QueriedItem from 'components/QueriedItem';
import _ from 'lodash'
function QueriedItemList(props) {
  let items;
  if (props.items.length > 0){
    items = props.items.map((item, index) => {
      if (item.relationshipType !== 'touched'){
        return (
          <QueriedItem
            item={item}
            key={index}
            onClick={props.onClick} />
        )
      }

    })
  }
  else{
    items = <div style={{padding: '20px'}}>@_________@</div>
  }
  return (
    <div>
      {items}
    </div>
  );
}

QueriedItemList.propTypes = {
  items: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired
}

export default QueriedItemList;
