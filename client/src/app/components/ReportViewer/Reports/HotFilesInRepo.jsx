import React, {Component, PropTypes} from 'react';
import Radium from 'radium';
import FB from 'styles/flexbox';

class HotFilesInRepo extends Component {
  constructor(...args) {
    super(...args);
  }

  static displayName = 'HotFilesInRepo';

  static get propTypes() {
    return {}
  }

  render() {
    let data = this.props.data;
    let items = data.map((item, key) => {
      let {address, id} = item.data;
      // let title = '../' + address.slice(Math.max(address.length - 3, 1)).join('/');
      return (
        <div style={{
          ...styles.wrapper
        }} key={key}>
          <span style={{
            ...styles.content
          }}>{address}</span>
        </div>
      )
    })

    return (
      <div>{items}</div>

    );
  }
}

const styles = {
  content: {
    fontSize: '12'
  }

}

export default HotFilesInRepo;
