import { Component } from 'preact';
import { route } from 'preact-router';
import * as Constants from '../lib/constants';
import Rest from '../lib/rest-service';
import LocalStorageService from '../lib/local-storage-service';
import Stepper from '../components/stepper';
import Expandable from '../components/expandable';
import Toggle from '../components/toggle';
import GenericModal from '../components/genericModal';
import SelectDeviceModal from '../components/selectDeviceModal';

export default class UpdateScore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      match: null,
      devices: null,
      showConfirmEndMatch: false,
      showChooseOtherDevice: false,
      confirmedSharingWithDevices: [],
      gamesCollapsed: {}
    };
  }

  componentDidMount() {
    let match;
    Rest.get('matches/current').then(m => {
      if (m && m.id) {
        match = m;
        return Rest.get(`matches/can-update-score/${this.props.device.id}`);
      } else {
        return Promise.resolve(false);
      }
    }).then(canUpdateScore => {
      if (canUpdateScore) {
        let { gamesCollapsed } = this.state;
        match.games.forEach(g => gamesCollapsed[g.gameId] = !!g.gameFinished);
        this.setState({ match, gamesCollapsed });
      } else {
        console.warn(Constants.DEVICE_CANNOT_UPDATE_MATCH);
        route('/');
      }
    }).catch(e => {
      console.warn(Constants.DEVICE_CANNOT_UPDATE_MATCH);
      route('/');
    });

    Rest.get('devices').then(ds => {
      let devices = ds.filter(d => d && (!this.props.device || this.props.device.id !== d.id));
      this.setState({ devices });
    });
  }

  scoreChange = (game, playerNum, { amount }) => {
    let { match } = this.state;
    let { games } = match;
    let deviceId = this.props.device.id;
    let i = games.findIndex(g => g.gameId === game.gameId);
    if (i !== -1) {
      games[i][`score${ playerNum }`] = amount;
      Rest.post('games/update', { game: games[i], scorer: playerNum, deviceId }).then(() => {
        match.games = games;
        this.setState({ match });
      });
    }
  };

  toggleFinished = (id) => {
    const { match, gamesCollapsed } = this.state;
    let i = match.games.findIndex(g => g.gameId === id);
    if (i !== -1) {
      match.games[i].gameFinished = !match.games[i].gameFinished;
      let deviceId = this.props.device.id;
      Rest.post('games/update', { game: match.games[i], deviceId}).then(() => {
        this.setState({ match }, () => {
          if (match.games[i].gameFinished) {
            gamesCollapsed[match.games[i].gameId] = true;
            this.setState({ gamesCollapsed });
          }
        });
      });
    }
  };

  toggleExpanded = (gameId) => {
    let { gamesCollapsed } = this.state;
    if (gamesCollapsed.hasOwnProperty(gameId)) {
      gamesCollapsed[gameId] = !gamesCollapsed[gameId];
      this.setState({ gamesCollapsed });
    }
  };

  addGame = () => {
    Rest.post('games/add', Object.assign({ deviceId: this.props.device.id }, this.state)).then(g => {
      let { match, gamesCollapsed } = this.state;
      match.games.push(g);
      gamesCollapsed[g.gameId] = false;
      this.setState({ match, gamesCollapsed });
    });
  };

  confirmEndMatch = () => {
    this.setState({ showConfirmEndMatch: true });
  };

  endMatch = () => {
    let { match } = this.state;
    let deviceId = this.props.device.id;
    match.finished = 1;
    Rest.post('matches/finish', { match, deviceId }).then(() => {
      let matchIds = LocalStorageService.get('match-ids');
      if (matchIds) {
        let i = matchIds.indexOf(match.id);
        if (i !== -1) {
          matchIds.splice(i, 1);
          LocalStorageService.set('match-ids', matchIds);
        }
      }
      route(`/match-summary/${match.id}`);
    });
  };

  dismissEndMatchModal = () => {
    this.setState({ showConfirmEndMatch: false });
  };

  chooseOtherDevice = () => {
    this.setState({ showChooseOtherDevice: true });
  };

  dismissDeviceModal = () => {
    this.setState({ showChooseOtherDevice: false });
  };

  selectDevices = (devices) => {
    if (devices && devices.length > 0) {
      this.setState({ showChooseOtherDevice: false }, () => {
        let packet = Object.assign({
          deviceId: this.props.device.id
        }, this.state);
        packet.devices = devices;
        Rest.post('matches/add-devices', packet).then(() => {
          let msg = 'This match can now be updated by ';
          if (devices.length > 1) {
            msg += `${devices.slice(0, -1).map(d => d.name).join(', ')}, and ${devices[devices.length - 1].name}.`;
          } else {
            msg += `${devices[0].name}.`;
          }
          this.props.postAlert({ type: 'success', msg });
        }).catch(e => this.props.postAlert({ type: 'error', msg: e }));
      });
    }
  };

  render() {
    const { match, devices, showConfirmEndMatch, showChooseOtherDevice } = this.state;
    let games;
    if (match) {
        games = match.games.map((g, i) => {
          let title = `Game ${i + 1}`;
          if (g.gameFinished) {
            title += ` (F): ${g.player1Fname} ${g.score1} - ${g.player2Fname} ${g.score2}`;
          }

          return (
            <Expandable title={title} collapsed={ this.state.gamesCollapsed[g.gameId] } id={g.gameId} toggle={(id) => this.toggleExpanded(id)}>
              <div class="game-update-row">
                <div class="flex-col flex-center">
                  <h4>{ g.player1Fname } {g.player1Lname }</h4>
                  <Stepper full onChange={(e) => this.scoreChange(g, 1, e)} initialValue={g.score1}/>
                </div>
                <h4 class="align-center">vs.</h4>
                <div class="flex-col flex-center">
                  <h4>{ g.player2Fname } {g.player2Lname }</h4>
                  <Stepper full onChange={(e) => this.scoreChange(g, 2, e)} initialValue={g.score2}/>
                </div>
              </div>
              <div class="flex final-score-toggle">
                <label>Final?</label>
                <Toggle id={`game-${i}-finished`} toggled={this.toggleFinished} onOff={g.gameFinished} property={g.gameId} />
              </div>
            </Expandable>
          );
      });
    }

    return (
      <div class="main update-score">
        <h2 class="align-center">Update Score</h2>
        { games }
        <button class="btn faux-expandable margin-bottom-1rem" onClick={this.addGame}>
          <i class="fa fa-plus-circle"></i>
          <span>Add Game</span>
        </button>
        <button class="btn big secondary" onClick={this.confirmEndMatch}>
          <i class="fa fa-check"></i>
          <span>End Match</span>
        </button>
        { devices && devices.length > 0 ?
          <button class="btn big primary change-device-btn" onClick={this.chooseOtherDevice}>
            <div class="exchange-btns">
              <i class="fa fa-mobile"></i>
              <i class="fa fa-exchange"></i>
              <i class="fa fa-mobile"></i>
            </div>
            <span>Let Other Devices Update</span>
          </button>
          : null
        }
        <GenericModal
          header="Confirm End Match"
          show={showConfirmEndMatch}
          content="Are you sure you want to end this match?"
          confirmText="Yep! It's Over, son!"
          cancelText="Oops! No."
          confirm={this.endMatch}
          dismiss={this.dismissEndMatchModal}
        />
        <SelectDeviceModal {...this.state} {...this.props} select={this.selectDevices} dismiss={this.dismissDeviceModal} />
      </div>
    );
  }
}