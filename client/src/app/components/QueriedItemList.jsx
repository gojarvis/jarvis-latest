import { Component, PropTypes } from 'react';
import QueriedItem from 'components/QueriedItem';
import FlipMove from 'react-flip-move';

class QueriedItemList extends Component {
  constructor(...args) {
    super(...args);
  }

  _itemOnClick(nodeId) {
    this.props.fetchQueryItemsIfNeeded(nodeId);
  }

  render() {
    let items;
    if (!this.props.isFetching && this.props.items.length > 0){
      items = this.props.items.map((item, index) => {
        if (item.relationshipType !== true){
          return (
            <QueriedItem
              item={item}
              key={index}
              onClick={this._itemOnClick.bind(this)} />
          )
        }

      })
    }
    else{
      items = <div style={{padding: '20px', textAlign: 'center'}}></div>
    }
    return (
      <FlipMove enterAnimation='fade' leaveAnimation='fade'>
        {items}
      </FlipMove>
    );
  }
}

export default QueriedItemList;
