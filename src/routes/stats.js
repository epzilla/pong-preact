import { Component } from 'preact';
import Rest from '../lib/rest-service';
import HeadToHeadPieChart from '../components/headToHeadPieChart';

export default class Stats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: null,
      pieData: null,
      activeIndex: -1
    };
  }

  componentDidMount() {
    Rest.get('stats/head-to-head/1/2').then(stats => {
      let pieData = [
        { label: stats.player1.player.fname, wins: stats.player1.matchesWon },
        { label: 'Draws', wins: stats.player1.matchesDrawn },
        { label: stats.player2.player.fname, wins: stats.player2.matchesWon }
      ];
      this.setState({ stats, pieData });
    });
  }

  onPieClick = (data, index) => {
    this.setState({
      activeIndex: index
    });
  };

  render() {
    return (
      <div class="main stats">
        <div class="pie-container">
          {  this.state.stats &&
            <HeadToHeadPieChart
              onPieClick={this.onPieClick}
              pieData={this.state.pieData}
              activeIndex={this.state.activeIndex}
            />
          }
        </div>
      </div>
    );
  }
}
