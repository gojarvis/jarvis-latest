import { Component, PropTypes } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FB from 'styles/flexbox';

class UserList extends Component {
  constructor(...args) {
    super(...args);
  }

  static get propTypes() {
    return {
      users: PropTypes.object.isRequired,
      selectedUsers: PropTypes.object.isRequired
    }
  }

  render() {
    let {users} = this.props;
    return (
      <div style={{...FB.base, ...FB.justify.start, ...LOCAL_STYLES.wrapper}}>

        <div>
          <span style={{ ...LOCAL_STYLES.label}}>Team Members</span>
          {users.map((item, index) => {
            let isSelected = this.props.selectedUsers.includes(item.get('id'));
            // console.log(item.toJS());
            return (
              <RaisedButton
                key={index}
                label={item.get('username')}
                primary={isSelected}
                secondary={!isSelected}
                onClick={() => { this.props.toggleFilterByUserId(item.get('id')) }}
                style={{flex: '0 1 auto', margin: '5px 10px'}} />
            );
          })}
        </div>
      </div>
    );
  }
}

const LOCAL_STYLES = {
  label: {
    marginLeft: '15px',
    marginRight: '10px'
  },
  wrapper: {
    minHeight: '60px',
    backgroundColor: '#414040',
    paddingTop: '10px'
  }
}

export default UserList;
