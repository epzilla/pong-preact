import { Component } from 'preact';
import Rest from '../lib/rest-service';
import HeadToHeadPieChart from '../components/headToHeadPieChart';

export default class Stats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: null,
      matchesData: null,
      gamesData: null,
      pointsData: null,
      activeMatchesIndex: -1,
      activeGamesIndex: -1,
      activePointsIndex: -1,
      largestMatchesValue: 0,
      largestGamesValue: 0,
      largestPointsValue: 0
    };
  }

  componentDidMount() {
    Rest.get('stats/head-to-head/1/2').then(stats => {
      let matchesData = [
        { label: stats.player1.player.fname, wins: stats.player1.matchesWon },
        { label: stats.player2.player.fname, wins: stats.player2.matchesWon }
      ];
      if (stats.player1.matchesDrawn > 0) {
        matchesData.splice(1, 0, { label: 'Draws', wins: stats.player1.matchesDrawn });
      }
      let gamesData = [
        { label: stats.player1.player.fname, wins: stats.player1.gamesWon },
        { label: stats.player2.player.fname, wins: stats.player2.gamesWon }
      ];
      let pointsData = [
        { label: stats.player1.player.fname, wins: stats.player1.pointsFor },
        { label: stats.player2.player.fname, wins: stats.player2.pointsFor }
      ];
      let largestMatchesValue = Math.max(stats.player1.matchesWon, stats.player2.matchesWon);
      let largestGamesValue = Math.max(stats.player1.gamesWon, stats.player2.gamesWon);
      let largestPointsValue = Math.max(stats.player1.pointsFor, stats.player2.pointsFor);
      this.setState({ stats, matchesData, gamesData, pointsData, largestMatchesValue, largestGamesValue, largestPointsValue });
    });
  }

  onMatchesPieClick = (data, index) => {
    this.setState({
      activeMatchesIndex: index
    });
  };

  onGamesPieClick = (data, index) => {
    this.setState({
      activeGamesIndex: index
    });
  };

  onPointsPieClick = (data, index) => {
    this.setState({
      activePointsIndex: index
    });
  };

  render() {
    if (this.state.stats) {
      return (
        <div class="main stats">
          <div class="charts-container">
            <div class="chart-container">
              <h3 class="chart-header">Matches Won</h3>
              <div class="pie-container">
                <HeadToHeadPieChart
                  onPieClick={this.onMatchesPieClick}
                  pieData={this.state.matchesData}
                  activeIndex={this.state.activeMatchesIndex}
                  largestValue={this.state.largestMatchesValue}
                />
                {
                this.state.matchesData.length > 2 &&
                <p class="draws-footnote">{this.state.stats.player1.matchesDrawn} Draws</p>
              }
              </div>
            </div>
            <div class="chart-container">
              <h3 class="chart-header">Games Won</h3>
              <div class="pie-container">
                <HeadToHeadPieChart
                  onPieClick={this.onGamesPieClick}
                  pieData={this.state.gamesData}
                  activeIndex={this.state.activeGamesIndex}
                  largestValue={this.state.largestGamesValue}
                />
              </div>
            </div>
            <div class="chart-container">
              <h3 class="chart-header">Points Won</h3>
              <div class="pie-container">
                <HeadToHeadPieChart
                  onPieClick={this.onPointsPieClick}
                  pieData={this.state.pointsData}
                  activeIndex={this.state.activePointsIndex}
                  largestValue={this.state.largestPointsValue}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}
