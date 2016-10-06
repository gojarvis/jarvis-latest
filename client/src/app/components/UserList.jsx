import { Component, PropTypes } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FB from 'styles/flexbox';

class UserList extends Component {
  constructor(...args) {
    super(...args);
  }

  static displayName = 'UserList';

  static propTypes = {
    users: PropTypes.object.isRequired,
    selectedUsers: PropTypes.object.isRequired,
  }

  render() {
    let {users} = this.props;
    return (
      <div style={{...FB.base, ...FB.justify.start, ...styles.wrapper}}>
        <div style={{...FB.base, ...styles.filterButtons}}>
          {users.map((item, index) => {
            let isSelected = this.props.selectedUsers.includes(item.get('id'));
            let activeStyle = isSelected ? styles.selectedUser : ''
            let userImagePath = `https://avatars.githubusercontent.com/${item.get('username')}?size=60`;
            return (
              <div
                key={index}
                label={item.get('username')}
                primary={isSelected}
                secondary={!isSelected}
                onClick={() => { this.props.toggleFilterByUserId(item.get('id')) }}
                style={{...styles.filterButton, ...activeStyle}} >
                <img src={userImagePath} height='40' title={item.get('username')}/>

              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

const styles = {
  label: {
    marginLeft: '15px',
    marginRight: '10px'
  },
  wrapper: {
    minHeight: '60px',
    paddingTop: '10px'
  },
  selectedUser: {
    borderBottom: '5px solid #1e8935'
  },
  activeButton: {
    backgroundColor: 'grey'
  },
  inactiveButton: {
    backgroundColor: 'rgb(62, 66, 75)'
  },
  filterButton: {
    width: 40,
    textAlign: 'center',
    margin: 5,
    padding: 1,
    fontFamily: '"Lucida Grande", "Segoe UI", Ubuntu, Cantarell, sans-serif',
    fontSize: 15,
    cursor: 'pointer'
  },
  filterButtons: {
    ...FB.base,
    ...FB.justify.start,
  },
}

export default UserList;
