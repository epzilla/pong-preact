import { Component } from 'preact';
import { route } from 'preact-router';
import Rest from '../lib/rest-service';
import LocalStorageService from '../lib/local-storage-service';
import Stepper from '../components/stepper';
import Expandable from '../components/expandable';
import Toggle from '../components/toggle';
import GenericModal from '../components/genericModal';

export default class UpdateScore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      match: null,
      token: null,
      showConfirmEndMatch: false
    };
  }

  componentDidMount() {
    Rest.get('matches/current').then(match => {
      let token = LocalStorageService.get('match-token');
      this.setState({
        match: match,
        token: token && token.token ? token.token : null
      });
    });
  }

  scoreChange = (game, playerNum, { amount }) => {
    let { match, token } = this.state;
    let { games } = match;
    let i = games.findIndex(g => g.gameId === game.gameId);
    if (i !== undefined) {
      games[i][`score${ playerNum }`] = amount;
      Rest.post('games/update', { game: games[i], token: token }).then(game => {
        match.games = games;
        this.setState({ match });
      });
    }
  };

  toggleFinished = (id) => {
    const { match, token } = this.state;
    let i = match.games.findIndex(g => g.gameId === id);
    if (i !== -1) {
      match.games[i].gameFinished = !match.games[i].gameFinished;
      Rest.post('games/update', { game: match.games[i], token: token }).then(game => {
        this.setState({ match });
      });
    }
  };

  addGame = () => {
    Rest.post('games/add', this.state).then(g => {
      let { match } = this.state;
      match.games.push(g);
      this.setState({ match });
    });
  };

  confirmEndMatch = () => {
    this.setState({ showConfirmEndMatch: true });
  };

  endMatch = () => {
    let { match, token } = this.state;
    match.finished = 1;
    Rest.post('matches/finish', { match, token }).then(game => {
      LocalStorageService.delete('match-token');
      route(`/match-summary/${match.id}`);
    });
  };

  dismissEndMatchModal = () => {
    this.setState({ showConfirmEndMatch: false });
  };

  render() {
    const { match, showConfirmEndMatch, } = this.state;
    let games;
    if (match) {
        games = match.games.map((g, i) => {
          let title = `Game ${i + 1}`;
          if (g.gameFinished) {
            title += ` (F): ${g.player1Fname} ${g.score1} - ${g.player2Fname} ${g.score2}`;
          }

          return (
            <Expandable title={title} defaultCollapsed={ g.gameFinished }>
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
        <GenericModal
          header="Confirm End Match"
          show={showConfirmEndMatch}
          content="hey fella you really wanna end this thing?"
          confirmText="Yep! It's Over, son!"
          cancelText="Oops! No."
          confirm={this.endMatch}
          dismiss={this.dismissEndMatchModal}
        />
      </div>
    );
  }
}