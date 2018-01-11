const SelectList = ({ className, items, renderItem, callback }) => {
  return (
    <ul class={className + ' select-list'}>
      {
        items.map(item => {
          return (
            <li onClick={() => callback(item)}>{renderItem(item)}</li>
          )
        })
      }
    </ul>
  );
};

export default SelectList;