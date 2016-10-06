import { Component, PropTypes } from 'react';
import FB from 'styles/flexbox';
import RaisedButton from 'material-ui/RaisedButton';
import UserList from 'components/UserList';



let FileIcon = require('react-icons/lib/md/insert-drive-file')
let UrlIcon = require('react-icons/lib/fa/bookmark')
let GlobalIcon = require('react-icons/lib/fa/globe')

class Filters extends Component {
  constructor(...args) {
    super(...args);

    this.state = {
      filters: [
        { key: "", selected: true, label: "All", type: '', icon: GlobalIcon },
        { key: "files", selected: false, label: "Files", type: 'File', icon: FileIcon },
        { key: "urls", selected: false, label: "URLs", type: 'Url', icon: UrlIcon },
        // { key: "keywords", selected: false, label: "Keywords", type: 'Keyword' },
      ]
    }
  }

  static displayName = 'Filters';

  static defaultProps = {
    selectedFilter: PropTypes.string.isRequired
  };

  _handleFilter(filter) {
    this.props.setEndNodeType(filter.type);
  }

  render() {
    let filters = this.state.filters.map((filter, index) => {

      let selected = filter.type === this.props.selectedFilter;
      let zIndex = selected ? 0 : 5;

      let activeStatus = selected ? styles.activeButton : styles.inactiveButton
      let FilterIcon = filter.icon;
      return (
        <div
          key={index}
          label={filter.label}
          primary={selected}
          secondary={!selected}
          zIndex={zIndex}
          onClick={()=>this._handleFilter(filter)}
          style={{...styles.filterButton, ...activeStatus}} >

          <div>
            <div>
              <FilterIcon style={{...styles.filterIcon}}/>
            </div>

            <div style={{...styles.filterLabel}}>
              {filter.label}
            </div>
          </div>
        </div>
      )
    });

    return (
      <div style={{...FB.base, ...styles.wrapper}}>

        <div className="Filters" style={{...FB.base, ...FB.justify.start, width: '81%'}}>
          {filters}
        </div>
        <div style={{...FB.justify.end}}>
          <UserList
            users={this.props.users}
            selectedUsers={this.props.selectedUsers}
            {...this.props.boundActions}

            />
        </div>

      </div>
    );
  }
}

const styles = {
  wrapper: {
    backgroundColor: 'rgb(31, 37, 48)'
  },
  activeButton: {
    backgroundColor: 'rgb(98, 102, 112)'
  },
  inactiveButton: {
    backgroundColor: 'rgb(62, 66, 75)'
  },
  filterIcon: {
    fontSize: 15,
    marginBottom: 5
  },
  filterLabel: {
      fontSize: 10,
  },

  filterButton: {
    width: 30,
    padding: 10,
    textAlign: 'center',
    margin: 10,
    fontFamily: '"Lucida Grande", "Segoe UI", Ubuntu, Cantarell, sans-serif',

    cursor: 'pointer'
  },

  filterButtons: {
    ...FB.base,
    ...FB.justify.around,
  },
}

export default Filters;
