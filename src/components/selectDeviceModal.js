import { Component } from 'preact';
import { Link } from 'preact-router/match';
import { DEVICE_TYPES } from '../lib/constants';
import CSSTransitionGroup from 'preact-css-transition-group';
import DeviceIcon from './deviceIcon';
import SelectList from './selectList';

export default class SelectDeviceModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      devices: [],
      selectedDevices: []
    };
    this.isSubmitting = false;
  }

  componentWillReceiveProps({ devices }) {
    if (devices) {
      let selectableDevices = devices.filter(d => this.state.selectedDevices.indexOf(d) === -1);
      this.setState({ devices: selectableDevices });
    }
  }

  renderDeviceListItem = (device, highlighted) => {
    return (
      <div class="flex-center">
        <DeviceIcon type={device.type} />
        <span>{ device.name }</span>
      </div>
    );
  };

  toggleItemSelected = (device) => {
    let { selectedDevices } = this.state;
    const i = selectedDevices.indexOf(device);
    if (i === -1) {
      selectedDevices.push(device);
    } else {
      selectedDevices.splice(i, 1);
    }

    this.setState({ selectedDevices });
   };

   submit = () => {
    let { match, token } = this.props;
    let { selectedDevices } = this.state;
    this.props.select(selectedDevices);
   };

  render() {
    let modal;

    if (this.props.devices && this.props.devices.length > 0 && !!this.props.showChooseOtherDevice) {
      modal = (
        <div class="modal-wrapper select-device-modal-wrapper" key={1}>
          <div class="modal-backdrop select-device-modal-backdrop"></div>
          <div class="modal select-device-modal-main">
            <div class="modal-header">
              <h2>Select Device</h2>
              <button class="dismiss-btn" onClick={() => this.props.dismiss()}>&times;</button>
            </div>
            <div class="modal-body flex-1 flex-col">
              <div class="flex-1 flex-col margin-bottom-1rem">
                <div class="device-select-list-wrap flex-1 flex-col">
                  <SelectList className="device-select-list" selectedItems={this.state.selectedDevices} items={this.state.devices} callback={(d) => this.toggleItemSelected(d)} renderItem={this.renderDeviceListItem} />
                </div>
              </div>
              <div class="btn-wrap margin-1rem flex-shrink-0 flex-col">
                <button class="btn big success" onClick={this.submit}>Share</button>
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
    );
  }
}