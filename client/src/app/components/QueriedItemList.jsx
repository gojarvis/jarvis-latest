import { Component, PropTypes } from 'react';
import QueriedItem from 'components/QueriedItem';

class QueriedItemList extends Component {
  constructor(...args) {
    super(...args);
  }

  static get propTypes() {
    return {
      items: PropTypes.array.isRequired
    }
  }

  _itemOnClick(nodeId) {
    this.props.fetchQueryItemsIfNeeded(nodeId);
  }

  render() {
    let items;
    if (this.props.items.length > 0){
      items = this.props.items.map((item, index) => {
        if (item.relationshipType !== 'touched'){
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
      items = <div style={{padding: '20px'}}>@_________@</div>
    }
    return (
      <div>
        {items}
      </div>
    );
  }
}

export default QueriedItemList;
