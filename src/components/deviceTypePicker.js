import { DEVICE_TYPES } from '../lib/constants';
import DeviceIcon from './deviceIcon';

const DeviceTypePicker = ({ callback }) => {
  return (
    <div class="device-type-picker">
      {
        Object.keys(DEVICE_TYPES).map(type => {
          return (
            <div class="device-type-option" onClick={() => callback(DEVICE_TYPES[type])}>
              <DeviceIcon type={DEVICE_TYPES[type]} />
            </div>
          )
        })
      }
    </div>
  );
};

export default DeviceTypePicker;