import { Component } from 'preact';
import Rest from '../lib/rest-service';
import { Link } from 'preact-router/match';
import BoxScore from '../components/boxScore';
import LocalStorageService from '../lib/local-storage-service';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      players: [],
      recentMatches: [],
      currentMatch: null,
      canUpdateScore: false,
      matchInProgress: false
    };
  }

  componentDidMount() {
    Rest.get('players').then(players => this.setState({ players }));
    Rest.get('matches/most-recent/5').then(matches => {
      if (matches.length > 0) {
        let currentMatch = matches.shift();
        this.setState({
          currentMatch: currentMatch,
          recentMatches: matches,
          matchInProgress: !currentMatch.finished
        }, () => {
          if (this.state.matchInProgress) {
            try {
              let { token } = LocalStorageService.get('match-token');
              if (token) {
                Rest.get(`matches/can-update-score/${token}`).then(canUpdateScore => {
                  this.setState({ canUpdateScore });
                })
              }
            } catch (e) {
              console.info('Match token not found. Cannot update scores.');
            }
          }
        });
      }
    });

    const ws = new WebSocket(`ws://${window.location.hostname}:3000`);
    ws.onerror = () => console.log('WebSocket error');
    ws.onopen = () => console.log('WebSocket connection established');
    ws.onclose = () => console.log('WebSocket connection closed');
    ws.onmessage = (m) => alert(m);
  }

  render() {
    let { matchInProgress, currentMatch, recentMatches, canUpdateScore } = this.state;
    let matchStatus = matchInProgress ? 'Match in Progress' : 'Latest Match';
    return (
      <div class="main home">
        { currentMatch ? <h2 class="align-center primary-text">{ matchStatus }</h2> : null }
        { currentMatch ? <BoxScore jumbotron={true} match={ currentMatch } /> : null }
        { !matchInProgress ? <Link href="/new-match" class="btn big primary center margin-top-1rem">Start New Match</Link> : null }
        { matchInProgress && canUpdateScore ? <Link href="/update-score" class="btn big success update-score">Update Score</Link> : null }
        { recentMatches && recentMatches.length > 0 ? <hr /> : null }
        { recentMatches && recentMatches.length > 0 ? <h3 class="align-center primary-text">Recent Matches</h3> : null }
        { recentMatches && recentMatches.length > 0 ? recentMatches.map(rm => <BoxScore match={rm} />) : null }
      </div>
    );
  }
}
