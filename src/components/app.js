import { h, Component } from 'preact';
import { Router } from 'preact-router';

import Config from '../config';
import Header from './header';
import Home from '../routes/home';
import StartMatch from '../routes/startMatch';
import AddNewPlayer from '../routes/addNewPlayer';
import UpdateScore from '../routes/updateScore';
import DebugConsole from './debugConsole';
import NotSoSecretCode from './notSoSecretCode';
import GlobalKeyboardShortcuts from './globalKeyboardShortcuts';
import KeyboardShortcutHelp from './keyboardShortcutHelp';
import Rest from '../lib/rest-service';
import LocalStorageService from '../lib/local-storage-service';
import { lightenOrDarken } from '../lib/helpers';

export default class App extends Component {
	constructor(props) {
    super(props);
    this.ls = LocalStorageService;
    this.config = Config;
    this.state = {
      menu: false,
      kb: false,
      debugConsole: true
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

    // Subscribe to WebSockets for score/new game updates
    const ws = new WebSocket(`ws://${window.location.hostname}:3000`);
    ws.onerror = (e) => console.error(e);
    ws.onopen = () => console.log('WebSocket connection established');
    ws.onclose = () => console.log('WebSocket connection closed');
    ws.onmessage = (m) => console.info(m);
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
					<Home path="/" config={this.config} />
          <StartMatch path="/new-match/:num?/:addedPlayer?" config={this.config} />
          <UpdateScore path="/update-score" config={this.config} />
          <AddNewPlayer path="/add-new-player/:returnRoute?/:playerNum?" config={this.config} />
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
			</div>
		);
	}
}
