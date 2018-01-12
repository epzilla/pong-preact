import { Component } from 'preact';
import Rest from '../lib/rest-service';
import LocalStorageService from '../lib/local-storage-service';
import Expandable from '../components/expandable';

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

  render() {
    const { match } = this.state;
    let games;
    if (match) {
        games = match.games.map((g, i) => {
        return (
          <Expandable title={`Game ${i + 1}`} defaultCollapsed={ g.gameFinished }>
            <div class="flex-row">
              <h4>Game {i + 1}</h4>
            </div>
          </Expandable>
        );
      });
    }

    return (
      <div class="main update-score">
        <h2>Update Score</h2>
        { games }
      </div>
    );
  }
}