import { Component } from 'preact';
import { route } from 'preact-router';
import Rest from '../lib/rest-service';
import LocalStorageService from '../lib/local-storage-service';
import SelectPlayerModal from '../components/selectPlayerModal';
import Stepper from '../components/stepper';
import SegmentedControl from '../components/SegmentedControl';

export default class StartMatch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      player1: null,
      player2: null,
      isSelectingPlayer: 0,
      players: [],
      playTo: props.config && props.config.playTo ? props.config.playTo : 21,
      winByTwo: props.config && props.config.winByTwo,
      bestOf: props.config && props.config.bestOf ? props.config.bestOf : 4,
      updateEveryPoint: 1
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
    Rest.post('matches/create', packet).then(({ match }) => {
      LocalStorageService.delete('start-match-state');
      let matchIds = LocalStorageService.get('match-ids');
      if (!matchIds || matchIds.length === 0) {
        matchIds = [match.id];
      } else {
        matchIds.push(match.id);
      }
      LocalStorageService.set('match-ids', matchIds);
      route('/update-score');
    })
  };

  addNewPlayer = (num) => {
    if (this.state.player1 || this.state.player2) {
      LocalStorageService.set('start-match-state', this.state);
    }
    route(`/add-new-player/new-match/${num}`);
  };

  onBestOfChange = (e) => {
    console.log(e);
  };

  onPlayToChange = (e) => {
    console.log(e);
  };

  onScoringTypeChange = (e) => {
    console.log(e);
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
        <hr />
        <div class="match-settings flex-col">
          <div class="flex-col margin-bottom-1rem">
            <div class="stepper-wrap flex-center">
              <label>Best of</label>
              <Stepper full onChange={(e) => this.onBestOfChange(e)} initialValue={this.state.bestOf} />
              <label>Games</label>
            </div>
            <hr />
            <div class="flex-center">
              <label>Play to</label>
              <Stepper full onChange={(e) => this.onPlayToChange(e)} initialValue={this.state.playTo}/>
              <label>Points</label>
            </div>
            <hr />
            <div class="flex-center flex-col update-scores-setting-control">
              <label>Update scores</label>
              <SegmentedControl
                options={[
                  { label: 'Point-by-point', value: 1 },
                  { label: 'After each game', value: 0 }
                ]}
                value={this.state.updateEveryPoint}
                onChange={(e) => this.onScoringTypeChange(e)}
              />
            </div>
          </div>
          <hr />
        </div>
        <div class="start-btn-wrap margin-bottom-1rem">
          <button class="btn success big" onClick={() => this.beginMatch()}>Begin</button>
        </div>
        <SelectPlayerModal {...this.state} select={this.selectPlayer} dismiss={this.dismissModal} />
      </div>
    );
  }
}