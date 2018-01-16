import { Component } from 'preact';
import * as Constants from '../lib/constants';
import Rest from '../lib/rest-service';
import LocalStorageService from '../lib/local-storage-service';
import DeviceTypePicker from '../components/deviceTypePicker';
import CSSTransitionGroup from 'preact-css-transition-group';

export default class SetDevice extends Component {
  constructor(props) {
    super(props);
    this.isSubmitting = false;
    this.state = {
      devices: [],
      name: null,
      type: Constants.DEVICE_TYPES.MOBILE_DEVICE,
      disableSubmit: false,
      addedDevice: null
    };
  }

  componentDidMount() {
    Rest.get('devices').then(devices => {
      this.setState({ devices }, () => {
        this.textInput.focus();
      });
    });

    this.setState({ type: this.getBestGuessDevice() });
  }

  getBestGuessDevice = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const greaterDimension = height >= width ? height : width;
    const lesserDimension = greaterDimension === height ? width: height;

    if (greaterDimension < 1000) {
      return Constants.DEVICE_TYPES.MOBILE_DEVICE;
    } else if (greaterDimension < 1400 && lesserDimension < 800) {
      return Constants.DEVICE_TYPES.TABLET_DEVICE;
    } else if (greaterDimension < 1800 && lesserDimension >= 800) {
      return Constants.DEVICE_TYPES.LAPTOP_DEVICE
    }

    return Constants.DEVICE_TYPES.OTHER_DEVICE;
  };

  setValue = (e) => {
    let obj = {};
    obj[e.target.name] = e.target.value;
    this.setState(obj);
  };

  setDeviceType = (type) => {
    this.setState({ type }, () => {
      window.smoothScroll(this.submitInput, 500);
    });
  };

  validate = () => {
    return new Promise((resolve, reject) => {
      if (!this.state.name) {
        return reject(Constants.NO_NAME_ENTERED);
      }

      let existingDevice = this.state.devices.find(d => d.name.toLowerCase() === this.state.name.toLowerCase());
      if (existingDevice) {
        return reject(Constants.NAME_ALREADY_EXISTS);
      }

      return resolve();
    });
  };

  submit = (e) => {
    e.preventDefault();
    if (!this.isSubmitting) {
      this.isSubmitting = true;
      let { name, type } = this.state;
      this.setState({ error: null, disableSubmit: true }, () => {
        this.validate()
          .then(() => {
            return Rest.post('devices', { name, type });
          })
          .then(dev => {
            let { devices } = this.state;
            devices.push(dev);
            this.setState({ dev, disableSubmit: false, addedDevice: dev }, () => {
              this.isSubmitting = false;
              LocalStorageService.set('device', dev);
              if (this.props.callback) {
                this.props.callback(dev);
              }
            });
          })
          .catch(e => {
            console.trace();
            this.setState({ error: e, disableSubmit: false }, () => this.isSubmitting = false);
          });
      });
    }
  };

  render() {
    return (
      <div class="main set-device">
        <h2>Welcome!</h2>
        <p>{Constants.SET_DEVICE_NAME_PROMPT}</p>
         <form class="flex-1 flex-col pad-1rem" onSubmit={(e) => this.submit(e)}>
          <div class="form-group big">
            <label for="name">Device Name</label>
            <input type="text" id="name" name="name" onChange={this.setValue} ref={(input) => { this.textInput = input; }} />
          </div>
          <div class="form-group big">
            <label for="name">Device Type</label>
            <DeviceTypePicker selectedType={this.state.type} callback={this.setDeviceType}/>
          </div>
          <input class="btn big success" type="submit" disabled={this.state.disableSubmit} value="Add" ref={(input) => { this.submitInput = input; }} />
          { this.state.error ?
            <p class="alert alert-error">{ this.state.error }</p>
            : null
          }
          { !!this.state.addedDevice && !this.state.error ?
            <p class="alert alert-success">Added!</p>
            : null
          }
        </form>
      </div>
    );
  }
}
