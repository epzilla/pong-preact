import { Component } from 'preact';
import { route } from 'preact-router';
import Rest from '../lib/rest-service';
import LocalStorageService from '../lib/local-storage-service';
import SelectPlayerModal from '../components/selectPlayerModal';

export default class StartMatch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      player1: null,
      player2: null,
      isSelectingPlayer: 0,
      players: []
    }
  }

  componentDidMount() {
    Rest.get('players').then(players => {
      this.setState({ players }, () => {
        let cachedState = LocalStorageService.get('start-match-state');
        let { num, addedPlayer } = this.props;
        let player;
        if (num && addedPlayer) {
          player = this.state.players.find(p => p.id === parseInt(addedPlayer));
        }

        if (player) {
          let stateCopy = Object.assign({}, this.state);
          if (cachedState.player1) {
            stateCopy.player1 = cachedState.player1;
          }
          if (cachedState.player2) {
            stateCopy.player2 = cachedState.player2;
          }
          stateCopy[`player${num}`] = player;
          this.setState(stateCopy);
        } else {
          this.setState({
            player1: cachedState && cachedState.player1 ? cachedState.player1 : players[0],
            player2: cachedState && cachedState.player2 ? cachedState.player2 : players[1]
          });
        }
      });
    });
  }

  setAndCacheState = (obj) => {
    this.setState(obj, () => {
      let { player1, player2 } = this.state;
      LocalStorageService.set('start-match-state', { player1, player2 });
    });
  };

  selectPlayer = (p) => {
    if (this.state.isSelectingPlayer === 1) {
      this.setAndCacheState({ player1: p, isSelectingPlayer: null });
    } else if (this.state.isSelectingPlayer === 2) {
      this.setAndCacheState({ player2: p, isSelectingPlayer: null });
    }
  };

  dismissModal = () => {
    this.setState({ isSelectingPlayer: null });
  };

  beginMatch = () => {
    let packet = Object.assign({ deviceId: this.props.device.id }, this.state);
    Rest.post('matches/create', packet).then(({ token }) => {
      LocalStorageService.delete('start-match-state');
      LocalStorageService.set('match-token', { token });
      route('/update-score');
    })
  };

  addNewPlayer = (num) => {
    if (this.state.player1 || this.state.player2) {
      LocalStorageService.set('start-match-state', this.state);
    }
    route(`/add-new-player/new-match/${num}`);
  };

  render() {
    let { player1, player2 } = this.state;
    return (
      <div class="main new-match">
        <h2>Start New Match</h2>
        <div class="player-select-blocks">
          {
            player1 ?
            <div class="player-selected-block flex-col flex-center">
              <h3>{ player1.fname } { player1.lname }</h3>
              {
                this.state.players.length > 2 ?
                <button class="btn primary" onClick={() => this.setState({ isSelectingPlayer: 1 })}>Change</button> :
                <button class="btn primary" onClick={() => this.addNewPlayer(1)}>Add New Player</button>
              }
            </div>
            :
            <div class="player-selected-block flex-col flex-center">
              <button class="btn primary big" onClick={() => this.setState({ isSelectingPlayer: 1 })}>Select</button>
            </div>
          }
          <div class="versus-separator">vs.</div>
          {
            player2 ?
            <div class="player-selected-block flex-col flex-center">
              <h3>{ player2.fname } { player2.lname }</h3>
              {
                this.state.players.length > 2 ?
                <button class="btn primary" onClick={() => this.setState({ isSelectingPlayer: 2 })}>Change</button> :
                <button class="btn primary" onClick={() => this.addNewPlayer(2)}>Add New Player</button>
              }
            </div>
            :
            <div class="player-selected-block flex-col flex-center">
              <button class="btn secondary big" onClick={() => this.setState({ isSelectingPlayer: 2 })}>Select</button>
            </div>
          }
        </div>
        <div class="start-btn-wrap">
          <button class="btn success big" onClick={() => this.beginMatch()}>Begin</button>
        </div>
        <SelectPlayerModal {...this.state} select={this.selectPlayer} dismiss={this.dismissModal} />
      </div>
    );
  }
}