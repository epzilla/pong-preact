import { Component } from 'preact';
import { SCORE_UPDATE, GAME_FINISHED, GAME_STARTED, MATCH_FINISHED } from '../lib/constants';
import Rest from '../lib/rest-service';
import WebSocketService from '../lib/websocket-service';
import BoxScore from './boxScore';
import CSSTransitionGroup from 'preact-css-transition-group';

export default class LiveScoreboard extends Component {
  constructor(props) {
    super(props);
    this.state = { match: props.match };
  }

  componentWillMount() {
    WebSocketService.register(SCORE_UPDATE, this.onScoreUpdate);
    WebSocketService.register(GAME_STARTED, this.onGameStart);
    WebSocketService.register(GAME_FINISHED, this.onGameFinish);
    WebSocketService.register(MATCH_FINISHED, this.onMatchFinish);
  }

  componentWillUnmount() {
    WebSocketService.unregister(SCORE_UPDATE, this.onScoreUpdate);
    WebSocketService.unregister(GAME_STARTED, this.onGameStart);
    WebSocketService.unregister(GAME_FINISHED, this.onGameFinish);
    WebSocketService.unregister(MATCH_FINISHED, this.onMatchFinish);
  }

  onScoreUpdate = ({ game, scorer }) => {
    let { match } = this.state;
    let i = match.games.findIndex(g => g.gameId === game.gameId);
    if (i !== -1) {
      match.games[i] = game;
      this.setState({ match });
    }
  };

  onGameStart = (game) => {
    let { match } = this.state;
    let i = match.games.findIndex(g => g.gameId === game.gameId);
    if (i === -1) {
      match.games.push(game);
      this.setState({ match });
    }
  };

  onGameFinish = ({ game }) => {
    let { match } = this.state;
    let i = match.games.findIndex(g => g.gameId === game.gameId);
    if (i !== -1) {
      match.games[i] = game;
      this.setState({ match });
    }
  };

  onMatchFinish = ({ match }) => {
    // let { match } = this.state;
    // let i = match.games.findIndex(g => g.gameId === game.gameId);
    // if (i !== -1) {
    //   match.games[i] = game;
    //   this.setState({ match });
    // }
  };

  render() {
    return <BoxScore jumbotron={true} match={this.state.match} />
  }
}
