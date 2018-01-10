import { h, Component } from 'preact';
import Rest from '../lib/rest-service';
import { Link } from 'preact-router/match';
import StatsTable from '../components/statsTable';
import Expandable from '../components/expandable';
import Avatar from '../components/avatar';
import { getSeason } from '../lib/helpers';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.years = [];
    const thisYear = new Date().getFullYear();
    for (let i = thisYear + 1; i >= this.props.config.firstSeason; i--) {
      this.years.push(i);
    }

    this.state = {
      year: thisYear,
      season: getSeason(thisYear),
      games: []
    };
  }

  componentWillReceiveProps({ team, teams, config }) {
    if (team) {
      this.setTeam(team);
    }
  }

  setTeam = (team) => {
    Rest.get(`games-by-team-season/${team.id}/${this.state.year}`).then(games => {
      this.setState({ games, team });
    })
  };

  onChange = (e) => {
    if (e && e.target.value) {
      let yr = parseInt(e.target.value);
      this.setState({ year: yr, season: getSeason(yr) }, () => {
        this.setTeam(this.state.team);
      });
    }
  };

  render() {
    return (
      <div class="main home">
        { this.state.team ? <h2 class="align-center primary-text">{ this.state.season } { this.state.team.title } Football Club</h2> : null }
        <div class="year-select-wrapper flex-center">
          <select class="big-select margin-bottom-1rem" onChange={this.onChange}>
            {
              this.years.map(y => <option value={y} selected={y === this.state.year}>{y}</option>)
            }
          </select>
        </div>
        <StatsTable year={this.state.year} games={this.state.games} showRecord={true} {...this.props} />
      </div>
    );
  }
}
