const Toggle = ({ onOff, toggled, property, id }) => {

  return (
    <div class="toggle">
      <input id={id} type="checkbox" checked={onOff} onChange={(e) => toggled(property)} />
      <label for={id}>Toggle</label>
    </div>
  );
};

export default Toggle;