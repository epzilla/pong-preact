import { Component } from 'preact';
import Rest from '../lib/rest-service';
import { Link } from 'preact-router/match';
import { NEW_MATCH_PERMISSION_GRANTED } from '../lib/constants';
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
        }, this.checkCanUpdate);
      }
    });
  }

  componentWillReceiveProps({ updatableMatchIds }) {
    if (updatableMatchIds && updatableMatchIds.length > 0) {
      this.checkCanUpdate(updatableMatchIds)
    }
  }

  checkCanUpdate = () => {
    if (this.state.matchInProgress) {
      Rest.get(`matches/can-update-score/${this.props.device.id}`).then(canUpdateScore => {
        let showNewPermission = !this.state.canUpdateScore && canUpdateScore && this.props.postAlert;
        this.setState({ canUpdateScore }, () => {
          if (showNewPermission) {
            this.props.postAlert({ type: 'success', msg: NEW_MATCH_PERMISSION_GRANTED });
          }
        });
      });
    }
  };

  render() {
    let { matchInProgress, currentMatch, recentMatches, canUpdateScore } = this.state;
    let matchStatus = matchInProgress ? 'Match in Progress' : 'Latest Match';
    return (
      <div class="main home">
        { currentMatch ? <h2 class="align-center primary-text">{ matchStatus }</h2> : null }
        { currentMatch ? <BoxScore jumbotron={true} match={ currentMatch } /> : null }
        { !matchInProgress && this.props.device ? <Link href="/new-match" class="btn big primary center margin-top-1rem">Start New Match</Link> : null }
        { matchInProgress && canUpdateScore ? <Link href="/update-score" class="btn big success update-score">Update Score</Link> : null }
        { recentMatches && recentMatches.length > 0 ? <hr /> : null }
        { recentMatches && recentMatches.length > 0 ? <h3 class="align-center primary-text">Recent Matches</h3> : null }
        { recentMatches && recentMatches.length > 0 ? recentMatches.map(rm => <BoxScore match={rm} />) : null }
      </div>
    );
  }
}
