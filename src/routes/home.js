import { Component } from 'preact';
import Rest from '../lib/rest-service';
import { Link } from 'preact-router/match';
import StatsTable from '../components/statsTable';
import Expandable from '../components/expandable';
import Avatar from '../components/avatar';
import format from 'date-fns/format';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      players: [],
      recentMatches: [],
      currentMatch: null,
      matchInProgress: false
    };
  }

  componentDidMount() {
    Rest.get('players').then(players => this.setState({ players }));
    Rest.get('most-recent/5').then(matches => {
      if (matches.length > 0) {
        let currentMatch = matches.shift();
        this.setState({
          currentMatch: currentMatch,
          recentMatches: matches,
          matchInProgress: !currentMatch.finished
        });
      }
    });
  }

  render() {
    let matchStatus = this.state.matchInProgress ? 'Match in Progress' : 'Latest Match';
    return (
      <div class="main home">
        { !this.state.matchInProgress ? <Link href="/new-match" class="btn primary">Start New Match</Link> : null }
        { this.state.currentMatch ? <h2 class="align-center primary-text">{ matchStatus }</h2> : null }
        { this.state.currentMatch ?
          <div class="scoreboard">
            { JSON.stringify(this.state.currentMatch) }
          </div>
          : null
        }
        { this.state.matchInProgress ? <Link href="/update-score" class="btn success">Update Score</Link> : null }
        { this.state.recentMatches ?
          this.state.recentMatches.map(rm => {
            return (
              <p>
                <span>{ rm.games[0].player1Fname }</span>
                <span>vs.</span>
                <span>{ rm.games[0].player2Fname }</span>
                <span>{ format(rm.dateTime, 'M/D/YY') }</span>
              </p>
            )
          })
          : null
        }
      </div>
    );
  }
}
