import { DEVICE_TYPES } from '../lib/constants';
import DeviceIcon from './deviceIcon';

const DeviceTypePicker = ({ callback, selectedType }) => {
  return (
    <div class="device-type-picker">
      {
        Object.keys(DEVICE_TYPES).map(type => {
          return (
            <div class={`device-type-option ${DEVICE_TYPES[type] === selectedType ? 'selected' : ''}`} onClick={() => callback(DEVICE_TYPES[type])}>
              <DeviceIcon type={DEVICE_TYPES[type]} />
              <label>{ DEVICE_TYPES[type] }</label>
            </div>
          )
        })
      }
    </div>
  );
};

export default DeviceTypePicker;