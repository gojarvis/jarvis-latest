import { Component, PropTypes } from 'react';
import FB from 'styles/flexbox';
import RaisedButton from 'material-ui/RaisedButton';

class Filters extends Component {
  constructor(...args) {
    super(...args);

    this.state = {
      filters: [
        { key: "", selected: true, label: "All", type: '' },
        { key: "files", selected: false, label: "Files", type: 'File' },
        { key: "urls", selected: false, label: "URLs", type: 'Url' },
        { key: "keywords", selected: false, label: "Keywords", type: 'Keyword' },
      ]
    }
  }

  static get defaultProps() {
    return {
      selectedFilter: PropTypes.string.isRequired
    }
  }

  _handleFilter(filter) {
    this.props.setEndNodeType(filter.type);
  }

  render() {
    return (
      <div className="Filters" style={{...FB.base}}>{
        this.state.filters.map((filter, index) => {
          let selected = filter.type === this.props.selectedFilter;
          let zIndex = selected ? 0 : 5;

          return (
            <RaisedButton
              key={index}
              label={filter.label}
              primary={selected}
              secondary={!selected}
              zIndex={zIndex}
              onClick={()=>this._handleFilter(filter)}
              style={{flex: '1 1 auto', margin: 10}} />
          )
        })
      }</div>
    );
  }
}

const styles = {
  filterButton: {
    ...FB.base,
    ...FB.justify.center,
    ...FB.flex.equal,
  },
  filterButtons: {
    ...FB.base,
    ...FB.justify.around,
  },
}

export default Filters;
