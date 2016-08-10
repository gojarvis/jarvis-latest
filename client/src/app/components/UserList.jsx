import {Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FB from 'styles/flexbox';

let UserList = (props) => {
  let {users} = props;
  console.log('USERS', users.toJS());
  return (
    <div style={{...FB.base, ...FB.justify.start}}>

      {users.map((item, index) => {
        console.log('username', item.username);
        return <RaisedButton
          key={index}
          label="hello"
          primary={item.selected}
          secondary={!item.selected}
          onClick={()=>props.onClick(item)}
          style={{flex: '0 1 auto', margin: '5px 10px'}} />
      })}
    </div>
  );
}

export default UserList;
