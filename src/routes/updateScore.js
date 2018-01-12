import { Component } from 'preact';
import Rest from '../lib/rest-service';
import LocalStorageService from '../lib/local-storage-service';
import Stepper from '../components/stepper';
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

  p1ScoreChange = (e) => {
    console.log(e);
  };

  p2ScoreChange = (e) => {
    console.log(e);
  };

  render() {
    const { match } = this.state;
    let games;
    if (match) {
        games = match.games.map((g, i) => {
        return (
          <Expandable title={`Game ${i + 1}`} defaultCollapsed={ g.finished }>
            <div class="game-update-col flex-col flex-center">
              <div class="flex">
                <h4>{ g.player1Fname } {g.player1Lname }</h4>
                <div class="flex-pull-right">
                  <Stepper full onChange={this.p1ScoreChange} initialValue={21}/>
                </div>
              </div>
              <div class="flex">
                <h4>{ g.player2Fname } {g.player2Lname }</h4>
                <div class="flex-pull-right">
                  <Stepper full onChange={this.p2ScoreChange} initialValue={21}/>
                </div>
              </div>
            </div>
          </Expandable>
        );
      });
    }

    return (
      <div class="main update-score">
        <h2 class="align-center">Update Score</h2>
        { games }
      </div>
    );
  }
}