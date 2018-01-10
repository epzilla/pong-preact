import { h, Component } from 'preact';
import Rest from '../lib/rest-service';
import LocalStorageService from '../lib/local-storage-service';
import { gamePlayed } from '../lib/helpers';

export default class Yearly extends Component {
  constructor(props) {
    super(props);
    this.years = [];
    this.currentYear = new Date().getFullYear();
    this.champs = this.props.config.championships;
    this.warYears = this.props.config.warYears;

    for (let i = this.currentYear + 1; i >= this.props.config.firstSeason; i--) {
      this.years.push(i);
    }

    this.state = {
      year: this.currentYear,
      results: []
    };

    this.getYear(this.currentYear);
  }

  componentDidMount() {
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('keydown', this.onKeyDown, true);
    document.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('keydown', this.onKeyDown, true);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown, true);
    document.removeEventListener('keyup', this.onKeyUp);
  }

  onKeyDown = (e) => {
    if (e.key === ' ' && e.target.nodeName === 'TR') {
      let btn = e.target.querySelector('.btn');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        btn.click();
      }
    }
  };

  onKeyUp = ({ key, target }) => {
    if (target.nodeName !== 'INPUT') {
      switch (key) {
        case '/':
          let input = document.querySelector('.main.yearly input');
          if (input) {
            input.focus();
          }
          break;
        case 'ArrowLeft':
          this.prev();
          break;
        case 'ArrowRight':
          this.next();
          break;
      }
    }
  }

  onChange = (e) => {
    if (e && e.target.value) {
      this.changeYear(parseInt(e.target.value));
    }
  };

  changeYear = (year) => {
    this.setState({ year });
    this.getYear(year);
  };

  getYear = (year) => {
    let results = LocalStorageService.get(`yr-${year}`);
    if (results) {
      this.setState({ results: results });
    }

    Rest.get(`year/${year}`).then(res => {
      this.setState({ results: res });
      if (JSON.stringify(res) !== JSON.stringify(results)) {
        LocalStorageService.set(`yr-${year}`, res);
      }
    });
  };

  toggleAttend = (id) => {
    Rest.post(`updateAttendance/${id}`).then(() => {
      this.props.toggleUserAttend(id);
    });
  };

  next = () => {
    let year = this.state.year + 1;
    if (year <= this.currentYear + 1) {
      this.changeYear(year);
    }
  };

  prev = () => {
    let year = this.state.year - 1;
    if (year >= this.props.config.firstSeason) {
      this.changeYear(year);
    }
  };

  render() {
    let self = this;
    let table;
    let rows = [];
    let record = { w: 0, l: 0, t: 0, confW: 0, confL: 0, confT: 0 };
    let year = this.state.year;
    let warYear;

    if (!this.warYears || this.warYears.indexOf(year) === -1) {
      rows = this.state.results.map((game, i) => {
        let resText;
        let rowClass = game.confGame ? 'conf-game' : '';
        let attendCol;

        if (game.result === 'W') {
          resText = 'W';
          rowClass += ' win';
          record.w++;
          if (game.confGame) {
            record.confW++;
          }
        } else if (game.result === 'L') {
          resText = 'L';
          rowClass += ' loss';
          record.l++;
          if (game.confGame) {
            record.confL++;
          }
        } else {
          rowClass += ' tie';
          resText = '--';
          if (year < 1996) {
            resText = 'T';
            record.t++;
            if (game.confGame) {
              record.confT++;
            }
          }
        }

        let dateParts = game.date.split('-');
        let date = `${dateParts[1]}/${dateParts[2]}`;

        if (this.props.user && year <= this.currentYear) {
          if (gamePlayed(game)) {
            let didAttend = this.props.user.games.indexOf(game._id) !== -1;
            attendCol = (
              <td>
                <button class={didAttend ? 'btn primary attended' : 'btn not-attended'} onClick={() => self.toggleAttend(game._id)}>
                  {didAttend ? '✔' : '—'}
                </button>
              </td>
            );
          }
          else {
            attendCol = <td></td>;
          }
        }

        return (
          <tr class={rowClass} tabindex={i + 11}>
            <td>{date}</td>
            <td class="center">{resText}</td>
            <td class="logo-td center">
              <div class={`team-logo logo-${ game.opponent.replace(/\s+/g, '').replace(/&/g, '').replace(/\./g, '') }`}></div>
            </td>
            <td>
              <span class="larger">{game.opponent}</span>
              <span class="smaller">{game.opponentShortName}</span>
              <span class="smallest">{game.opponentAbbrev}</span>
            </td>
            <td>{ `${game.teamScore}–${game.opScore}` }</td>
            <td class="larger">
              <span>{game.location}</span>
            </td>
            <td class="center smaller">
              <span>{game.homeAwayNeutral}</span>
            </td>
            { attendCol }
          </tr>
        );
      });

      table = (
        <table class="capped-size-table">
          <thead>
            <th>Date</th>
            <th class="center">W/L</th>
            <th class="center"></th>
            <th>
              <span class="larger">Opponent</span>
              <span class="smaller">Team</span>
            </th>
            <th>Score</th>
            <th class="center smaller">
              <span class="smaller">Loc</span>
            </th>
            <th class="larger">
              <span>Location</span>
            </th>
            { this.props.user && year <= this.currentYear ? <th class="center">Attended?</th> : null }
          </thead>
          <tbody>
            { rows }
          </tbody>
        </table>
      );
    }

    let confChampBanner;
    let natChampBanner;

    // Iterate over division championships and if one is found for this year, set the banner
    let divChamps = this.champs && this.champs.division ? Object.keys(this.champs.division) : [];
    for (let i = 0; i < divChamps.length; i++) {
      if (this.champs.division[divChamps[i]].indexOf(year) !== -1) {
        confChampBanner = <h3 class="record-stat div-champ-banner">{divChamps[i]} Champions</h3>;
        break;
      }
    }

    // Do the same for conference championships (which overwrite divisional championships, as those are implied)
    let confChamps = this.champs && this.champs.conference ? Object.keys(this.champs.conference) : [];
    for (let i = 0; i < confChamps.length; i++) {
      if (this.champs.conference[confChamps[i]].indexOf(year) !== -1) {
        confChampBanner = <h2 class="record-stat conf-champ-banner">{confChamps[i]} Champions</h2>;
        break;
      }
    }

    // Finally, do the iteration for national championships
    let natChamps = this.champs && this.champs.national ? Object.keys(this.champs.national) : [];
    for (let i = 0; i < natChamps.length; i++) {
      if (this.champs.national[natChamps[i]].indexOf(year) !== -1) {
        natChampBanner = <h1 class="record-stat nat-champ-banner">{natChamps[i]} National Champions</h1>;
        break;
      }
    }

    if (this.warYears && this.warYears.indexOf(year) !== -1) {
      warYear = (
        <div class="jumbotron">
          <h1>Allies 1 - Axis 0</h1>
          <img src="/assets/images/Uncle-Sam.jpg" />
        </div>
      );
    }

    return (
      <div class="main yearly">
        <h1>{ year } { this.props.config.team } Football results</h1>
        <div class="flex-center flex-col">
          <select class="big-select margin-bottom-1rem" onChange={this.onChange}>
            {
              this.years.map(y => <option value={y} selected={y === this.state.year}>{y}</option>)
            }
          </select>
          {table}
          {warYear}
          <h3 class="record-stat">
            {
              year < 1996 && record.t > 0 ?
              `${record.w}-${record.l}-${record.t} (${record.confW}-${record.confL}-${record.confT})` :
              `${record.w}-${record.l} (${record.confW}-${record.confL})`
            }
          </h3>
          {confChampBanner}
          {natChampBanner}
        </div>
      </div>
    );
  }
}
