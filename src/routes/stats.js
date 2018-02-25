import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css';
import 'react-virtualized-select/styles.css';
import { Component } from 'preact';
import format from 'date-fns/format';
import isAfter from 'date-fns/is_after'
import VirtualizedSelect from 'react-virtualized-select';
import Rest from '../lib/rest-service';
import BoxScore from '../components/BoxScore';
import HeadToHeadPieChart from '../components/HeadToHeadPieChart';
import PerGameLineChart from '../components/PerGameLineChart';
import Toggle from '../components/Toggle';

export default class Stats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: null,
      players: null,
      p1: null,
      p2: null,
      matchesData: null,
      gamesData: null,
      pointsData: null,
      perGame: null,
      activeMatchesIndex: -1,
      activeGamesIndex: -1,
      activePointsIndex: -1,
      largestMatchesValue: 0,
      largestGamesValue: 0,
      largestPointsValue: 0,
      selectSearchable: false,
      submitEnabled: false,
      useDates: false,
      startDate: format(new Date(), 'YYYY-MM-DD'),
      endDate: format(new Date(), 'YYYY-MM-DD'),
      lineChartWidth: 800,
      lineChartHeight: 350
    };
  }

  componentDidMount() {
    if (window.matchMedia('(min-width: 800px)').matches) {
      this.setState({ selectSearchable: true });
    }

    window.addEventListener('resize', this.updateWidth);
    this.updateWidth();

    Rest.get('players').then(pls => {
      const players = pls.map(p => ({ label: `${p.fname} ${p.lname}`, value: p.id, disabled: false }));
      const p1 = players && players.length > 0 ? players[0] : null;
      const p2 = players && players.length > 1 ? players[1] : null;
      const submitEnabled = p1 && p2;
      this.setState({ players, p1, p2, submitEnabled });
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWidth);
  }

  updateWidth = () => {
    const lineChartWidth = Math.min(window.innerWidth - 32, 800);
    const lineChartHeight = Math.max(lineChartWidth * 0.4, 200);
    this.setState({ lineChartWidth, lineChartHeight });
  };

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

  toggleUseDates = () => {
    this.setState({ useDates: !this.state.useDates });
  };

  onDateStartChange = (e) => {
    this.setState({ startDate: format(e.target.value, 'YYYY-MM-DD') });
  };

  onDateEndChange = (e) => {
    this.setState({ endDate: format(e.target.value, 'YYYY-MM-DD') });
  };

  checkSubmit = () => {
    let submitEnabled = this.state.p1 && this.state.p2;
    this.setState({ submitEnabled });
  };

  submit = () => {
    const { p1, p2, useDates, startDate, endDate } = this.state;
    if (p1 && p2) {
      let dateQuery = '';
      if (useDates && startDate && (!endDate || !isAfter(startDate, endDate))) {
        dateQuery = `?from=${startDate}${endDate ? '&to=' + endDate : ''}`;
      }
      Rest.get(`stats/head-to-head/${p1.value}/${p2.value}${dateQuery}`).then(stats => {
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
        let perGameData = stats.player1.perGame.map(pg => {
          pg.p1 = stats.player1.player.fname;
          pg.p2 = stats.player2.player.fname;
          pg[stats.player1.player.fname] = pg.avgPointsFor;
          pg[stats.player2.player.fname] = pg.avgPointsAgainst;
          return pg;
        });
        let largestMatchesValue = Math.max(stats.player1.matchesWon, stats.player2.matchesWon);
        let largestGamesValue = Math.max(stats.player1.gamesWon, stats.player2.gamesWon);
        let largestPointsValue = Math.max(stats.player1.pointsFor, stats.player2.pointsFor);
        this.setState({ stats, matchesData, gamesData, pointsData, perGameData, largestMatchesValue, largestGamesValue, largestPointsValue }, () => {
          window.smoothScroll(this.resultHR, 250);
        });
      });
    }
  };

  render() {
    return (
      <div class="main stats">
        <h2>Head-to-Head Stats for:</h2>
        <div class="form-container">
          <div class="players-row">
            <div class="select-container">
              <VirtualizedSelect
                options={this.state.players}
                onChange={(p1) => this.setState({ p1 }, this.checkSubmit)}
                value={this.state.p1}
                searchable={this.state.selectSearchable}
              />
            </div>
            <span class="row-vs-span">vs.</span>
            <div class="select-container">
              <VirtualizedSelect
                options={this.state.players}
                onChange={(p2) => this.setState({ p2 }, this.checkSubmit)}
                value={this.state.p2}
                searchable={this.state.selectSearchable}
              />
            </div>
          </div>

          <div class="toggle-wrap">
            <label>Filter by date</label>
            <Toggle
              onOff={this.state.useDates}
              toggled={this.toggleUseDates}
              id="use-dates-toggle"
            />
          </div>
          {
            this.state.useDates &&
            <div class="dates-wrapper">
              <div class="date-input-wrapper">
                <label>From</label>
                <input id="date1" type="date" value={this.state.startDate} onChange={this.onDateStartChange} />
              </div>
              <div class="date-input-wrapper">
                <label>To</label>
                <input id="date2" type="date" value={this.state.endDate} onChange={this.onDateEndChange} />
              </div>
            </div>
          }
          <button class="btn primary" onClick={this.submit} disabled={!this.state.submitEnabled}>Submit</button>
        </div>
        <hr class="result-hr" ref={(r) => { this.resultHR = r; }} />
        {
          this.state.stats &&
          <div class="charts-container">
            <div class="chart-container">
              <h3 class="chart-header no-top-margin">Matches Won</h3>
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
            <div class="chart-container full-width">
              <h3 class="chart-header">Game-by-game Averages</h3>
              <div class="pie-container">
                <PerGameLineChart
                  data={this.state.perGameData}
                  p1={this.state.p1}
                  p2={this.state.p2}
                  width={this.state.lineChartWidth}
                  height={this.state.lineChartHeight}
                />
              </div>
            </div>
            <hr class="result-hr" />
            <div class="results-container">
              <h3 class="chart-header">Match Results</h3>
              {
                this.state.stats.matches.map(m => <BoxScore match={m} />)
              }
            </div>
          </div>
        }
      </div>
    );
  }
}
