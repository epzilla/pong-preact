import { h, Component } from 'preact';
import { route, Router } from 'preact-router';

import Config from '../config';
import Header from './header';
import Home from '../routes/home';
import StartMatch from '../routes/startMatch';
import AddNewPlayer from '../routes/addNewPlayer';
import UpdateScore from '../routes/updateScore';
import SetDevice from '../routes/setDevice';
import DebugConsole from './debugConsole';
import NotSoSecretCode from './notSoSecretCode';
import GlobalKeyboardShortcuts from './globalKeyboardShortcuts';
import KeyboardShortcutHelp from './keyboardShortcutHelp';
import FixedAlerts from './fixedAlerts';
import Rest from '../lib/rest-service';
import LocalStorageService from '../lib/local-storage-service';
import WebSocketService from '../lib/websocket-service';
import { lightenOrDarken } from '../lib/helpers';
import * as Constants from '../lib/constants';

export default class App extends Component {
	constructor(props) {
    super(props);
    this.ls = LocalStorageService;
    this.config = Config;
    this.state = {
      menu: false,
      kb: false,
      debugConsole: true,
      device: null,
      updatableMatchIds: null,
      alerts: []
    };
    let conf = this.ls.get('config');
    this.config = Config || conf;
    if (Config && JSON.stringify(conf) !== JSON.stringify(Config)) {
      this.ls.set('config', Config);
    }
  }

	/**
	 *  Gets fired when the route changes.
	 *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
	 *	@param {string} event.url	The newly routed URL
	 */
	handleRoute = e => {
    this.currentUrl = e.url;
    this.setState({ menu: false});
  };

  onDeviceSet = device => {
    let { alerts } = this.state;
    alerts.push({ type: 'success', msg: `Registered ${device.name}!`});
    this.setState({ device, alerts }, () => {
      route('/');
      setTimeout(() => this.setState({ alerts: [] }), 5000);
    })
  };

	menuToggledCallback = (menu) => {
    this.setState({ menu });
  };

  showKeyboardShortcuts = () => {
    this.setState({ kb: true });
  };

  hideKeyboardShortcuts = () => {
    this.setState({ kb: false });
  };

  toggleKeyboardShortcuts = () => {
    this.setState({ kb: !this.state.kb });
  };

  escapeKeyCallback = () => {
    if (this.state.kb) {
      this.hideKeyboardShortcuts();
    }
  };

  hideDebugConsole = () => {
    this.setState({ debugConsole: false });
  };

  showDebugConsole = () => {
    this.setState({ debugConsole: true });
  };

  // Passed as a prop to children to let them post alerts
  postAlert = (alert) => {
    let { alerts } = this.state;
    alerts.push(alert);
    this.setState({ alerts }, () => {
      setTimeout(() => {
        alerts = this.state.alerts;
        alerts.splice(alerts.indexOf(alert), 1);
        this.setState({ alerts });
      }, 5000);
    });
  };

  handleAddedDevicesToMatch = ({ match, deviceIds }) => {
    if (this.state.device) {
      let myDevice = deviceIds.indexOf(this.state.device.id);
      if (myDevice) {
        let matchIds = LocalStorageService.get('match-ids');
        if (!matchIds || matchIds.length === 0) {
          matchIds = [match.id];
        } else {
          matchIds.push(match.id);
        }
        LocalStorageService.set('match-ids', matchIds);
        this.setState({ updatableMatchIds: matchIds });
      }
    }
  };

	componentDidMount() {
    // Set CSS Custom Properties
    if (this.config && this.config.themeProperties) {
      Object.keys(this.config.themeProperties).forEach(key => {
        document.body.style.setProperty(`--${key}`, this.config.themeProperties[key]);
      });
      let pbg = this.config.themeProperties.primaryBtnBg;
      let sbg = this.config.themeProperties.secondaryBtnBg;
      document.body.style.setProperty('--primaryBtnBorder', pbg ? lightenOrDarken(pbg, -40) : '#888');
      document.body.style.setProperty('--secondaryBtnBorder', sbg ? lightenOrDarken(sbg, -40) : '#888');
    }

    WebSocketService.init().then(() => {
      WebSocketService.register(Constants.ADDED_DEVICES_TO_MATCH, this.handleAddedDevicesToMatch);
    });

    let device = this.ls.get('device');
    if (device) {
      this.setState({ device });
    } else {
      route('/set-device');
    }
  }

	render() {
		return (
			<div id="app">
				<Header
					config={this.config}
					menuToggledCallback={(e) => this.menuToggledCallback(e)}
					showKeyboardShortcuts={() => this.showKeyboardShortcuts()}
				/>
				<Router onChange={this.handleRoute}>
					<Home path="/" config={this.config} device={this.state.device} updatableMatchIds={this.state.updatableMatchIds} />
          <StartMatch path="/new-match/:num?/:addedPlayer?" config={this.config} device={this.state.device} />
          <UpdateScore path="/update-score" config={this.config} device={this.state.device} postAlert={this.postAlert} updatableMatchIds={this.state.updatableMatchIds} />
          <AddNewPlayer path="/add-new-player/:returnRoute?/:playerNum?" config={this.config} />
          <SetDevice path="/set-device" config={this.config} callback={this.onDeviceSet} />
				</Router>
        {
          (this.config.devMode && !this.state.debugConsole) ?
          <div class="debug-mode-btn-container" onClick={() => this.showDebugConsole()}>
              <i class="fa fa-bug"></i>
          </div>
          : null
        }
        { this.config.devMode ? <DebugConsole show={this.state.debugConsole} close={this.hideDebugConsole} /> : null }
				<NotSoSecretCode config={this.config} menu={this.state.menu} />
        <GlobalKeyboardShortcuts
          toggleKeyboardShortcuts={this.toggleKeyboardShortcuts}
          escape={this.escapeKeyCallback}
        />
        <KeyboardShortcutHelp config={this.config} show={this.state.kb} dismiss={() => this.hideKeyboardShortcuts()} />
        <audio preload id="secret-sound" src="/assets/sounds/secret.wav" />
        <FixedAlerts alerts={this.state.alerts} />
			</div>
		);
	}
}
