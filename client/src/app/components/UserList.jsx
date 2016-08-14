import {Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FB from 'styles/flexbox';

let UserList = (props) => {
  let {users} = props;
  return (
    <div style={{...FB.base, ...FB.justify.start, ...LOCAL_STYLES.wrapper}}>

      <div>
        <span style={{ ...LOCAL_STYLES.label}}>Team Members</span>
        {users.map((item, index) => {
          // console.log(item.toJS());
          return <RaisedButton
            key={index}
            label={item.get('username')}
            primary={item.get('selected')}
            secondary={!item.get('selected')}
            onClick={()=>props.onClick(item)}
            style={{flex: '0 1 auto', margin: '5px 10px'}} />
        })}
      </div>
    </div>
  );
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
