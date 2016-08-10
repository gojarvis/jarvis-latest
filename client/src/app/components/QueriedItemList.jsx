import QueriedItem from 'components/QueriedItem';

function QueriedItemList(props) {
  let items;
  if (props.items.length > 0){
    items = props.items.map((item, index) => {
      return (
        <QueriedItem
          item={item}
          key={index}
          onClick={props.onClick} />
      )
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

export default QueriedItemList;
