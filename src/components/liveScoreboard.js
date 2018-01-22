import { Component } from 'preact';
import { SCORE_UPDATE, GAME_FINISHED, GAME_STARTED, MATCH_FINISHED } from '../lib/constants';
import WebSocketService from '../lib/websocket-service';
import BoxScore from './boxScore';

export default class LiveScoreboard extends Component {
  constructor(props) {
    super(props);
    this.state = { match: props.match };
  }

  componentWillMount() {
    WebSocketService.subscribe(SCORE_UPDATE, this.onScoreUpdate);
    WebSocketService.subscribe(GAME_STARTED, this.onGameStart);
    WebSocketService.subscribe(GAME_FINISHED, this.onGameFinish);
    WebSocketService.subscribe(MATCH_FINISHED, this.onMatchFinish);
  }

  componentWillUnmount() {
    WebSocketService.unsubscribe(SCORE_UPDATE, this.onScoreUpdate);
    WebSocketService.unsubscribe(GAME_STARTED, this.onGameStart);
    WebSocketService.unsubscribe(GAME_FINISHED, this.onGameFinish);
    WebSocketService.unsubscribe(MATCH_FINISHED, this.onMatchFinish);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match) {
      this.setState({ match: nextProps.match });
    }
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

  onMatchFinish = (match) => {
    this.setState({ match });
  };

  render() {
    return <BoxScore flashFinal={this.props.flashFinal} jumbotron={true} match={this.state.match} />
  }
}
