import QueriedItem from 'components/QueriedItem';

function QueriedItemList(props) {
  return (
    <div>
      {props.items.map((item, index) => {
        return (
          <QueriedItem
            item={item}
            key={index}
            onClick={props.onClick} />
        )
      })}
    </div>
  );
}

export default QueriedItemList;
