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
      if (players.length > 2) {
        this.setState({ players });
      } else if (players.length === 2) {
        this.setState({
          players: players,
          player1: players[0],
          player2: players[1]
        });
      }
    });
  }

  selectPlayer = (p) => {
    if (this.state.isSelectingPlayer === 1) {
      this.setState({ player1: p, isSelectingPlayer: null });
    } else if (this.state.isSelectingPlayer === 2) {
      this.setState({ player2: p, isSelectingPlayer: null });
    }
  };

  dismissModal = () => {
    this.setState({ isSelectingPlayer: null });
  };

  beginMatch = () => {
    Rest.post('matches/create', this.state).then(({ token }) => {
      LocalStorageService.set('match-token', { token });
      route('/update-score');
    })
  };

  addNewPlayer = () => {
    route('/add-new-player');
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
                <button class="btn primary" onClick={() => this.addNewPlayer()}>Add New Player</button>
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
                <button class="btn primary" onClick={() => this.addNewPlayer()}>Add New Player</button>
              }
            </div>
            :
            <div class="player-selected-block flex-col flex-center">
              <button class="btn primary big" onClick={() => this.setState({ isSelectingPlayer: 2 })}>Select</button>
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