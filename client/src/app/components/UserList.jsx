import {Component} from 'react';
import RaisedButton from 'material-ui/lib/raised-button';
import FB from 'styles/flexbox';

let UserList = (props) => {
  let {users} = props;

  return (
    <div style={{...FB.base, ...FB.justify.start}}>
      {users.map((item, index) => {
        return <RaisedButton
          key={index}
          label={item.username}
          primary={index === 1}
          secondary={index === 2}
          onClick={()=>props.onClick(item)}
          style={{flex: '0 1 auto', margin: '5px 10px'}} />
      })}
    </div>
  );
}

export default UserList;
