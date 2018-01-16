import SelectList from './selectList';
import CSSTransitionGroup from 'preact-css-transition-group';
import { Link } from 'preact-router/match';
import DeviceIcon from './deviceIcon';

const renderDeviceListItem = (device, highlighted) => {
  return (
    <div class="flex-center">
      <DeviceIcon type={device.type} />
      <span>{ device.name }</span>
    </div>
  );
};

const SelectDeviceModal = ({ device, devices, showChooseOtherDevice, select, dismiss }) => {
  let modal;

  if (devices && devices.length > 0 && !!showChooseOtherDevice) {
    modal = (
      <div class="modal-wrapper select-player-modal-wrapper" key={1}>
        <div class="modal-backdrop select-player-modal-backdrop"></div>
        <div class="modal select-player-modal-main">
          <div class="modal-header">
            <h2>Select Device</h2>
            <button class="dismiss-btn" onClick={() => dismiss()}>&times;</button>
          </div>
          <div class="modal-body flex-1">
            <div class="flex-1 flex-col">
              <div class="player-select-list-wrap flex-1 flex-col">
                <SelectList className="player-select-list" items={devices} callback={(d) => select(d)} renderItem={renderDeviceListItem} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CSSTransitionGroup
      transitionName="modal-pop-in"
      transitionAppear={false}
      transitionLeave={true}
      transitionEnter={true}
      transitionEnterTimeout={200}
      transitionLeaveTimeout={200}
    >
      { modal || null }
    </CSSTransitionGroup>
  )
};

export default SelectDeviceModal;