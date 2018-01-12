import { Component } from 'preact';
import Rest from '../lib/rest-service';
import LocalStorageService from '../lib/local-storage-service';
import Stepper from '../components/stepper';
import Expandable from '../components/expandable';
import Toggle from '../components/toggle';

export default class UpdateScore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      match: null,
      token: null
    }
  }

  componentDidMount() {
    Rest.get('current-match').then(match => {
      this.setState({
        match: match,
        token: LocalStorageService.get('match-token')
      });
    });
  }

  scoreChange = (game, playerNum, { amount }) => {
    let { games } = this.state.match;
    let i = games.findIndex(g => g.gameId === game.gameId);
    if (i !== undefined) {
      games[i][`score${ playerNum }`] = amount;
      console.log(game);
      console.log(i);
      console.log(playerNum);
      console.log(amount);
      console.log(games[i]);
      Rest.post('games/update', games[i]).then(game => {
        console.info('yup');
      });
    }
  };

  toggleFinished = (id) => {
    const { match } = this.state;
    let game = match.games.find(g => g.gameId === id);
    if (game) {
      game.finished = !game.finished;
      game.gameFinished = game.finished;
      console.log(game);
      Rest.post('games/update', game).then(game => {
        console.info('yup');
      });
    }
  };

  render() {
    const { match } = this.state;
    let games;
    if (match) {
        games = match.games.map((g, i) => {
        return (
          <Expandable title={`Game ${i + 1}`} defaultCollapsed={ g.finished }>
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
              <Toggle id={`game-${i}-finished`} toggled={this.toggleFinished} onOff={g.finished} property={g.gameId} />
            </div>
          </Expandable>
        );
      });
    }

    return (
      <div class="main update-score">
        <h2 class="align-center">Update Score</h2>
        { games }
        <button class="btn faux-expandable margin-bottom-1rem">
          <i class="fa fa-plus-circle"></i>
          <span>Add Game</span>
        </button>
        <button class="btn big secondary">
          <i class="fa fa-check"></i>
          <span>End Match</span>
        </button>
      </div>
    );
  }
}