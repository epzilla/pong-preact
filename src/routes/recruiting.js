import { h, Component } from 'preact';
import Rest from '../lib/rest-service';
import LocalStorageService from '../lib/local-storage-service';

export default class Recruiting extends Component {
  constructor(props) {
    super(props);
    this.years = [];
    this.columns = [
      { field: 'lname', name: 'Name'},
      { field: 'pos', name: 'Pos'},
      { field: 'state', name: 'Hometown'},
      { field: 'hs', name: 'School', hideSmall: true},
      { field: 'rivalsStars', name: 'Rivals Stars', hideSmall: true, center: true},
      { field: 'scoutStars', name: 'Scout Stars', hideSmall: true, center: true},
      { field: 'rivalsRank', name: 'Rivals Rank', hideSmall: true, center: true},
      { field: 'scoutRank', name: 'Scout Rank', hideSmall: true, center: true},
      { field: 'avgStars', name: 'Stars', hideLarge: true, center: true},
      { field: 'avgRank', name: 'Rank', hideLarge: true, center: true}
    ];

    this.maps = this.props.config.recruitMaps;

    let d = new Date();
    this.currentYear = d.getMonth() < 2 ? d.getFullYear() : d.getFullYear() + 1;
    this.firstTrackedClass = this.props.config.firstTrackedRecruitingSeason || this.currentYear;

    for (let i = this.currentYear + 2; i >= this.firstTrackedClass; i--) {
      this.years.push(i);
    }

    this.state = {
      year: this.currentYear,
      recruits: [],
      sortCol: null,
      sortAsc: true
    };

    this.getRecruits(this.currentYear);
  }

  componentDidMount() {
    document.removeEventListener('keyup', this.onKeyUp);
    document.addEventListener('keyup', this.onKeyUp);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.onKeyUp);
  }

  onKeyUp = ({ key, target, shiftKey }) => {
    if (target.nodeName !== 'INPUT') {
      switch (key) {
        case '/':
          let input = document.querySelector('.main.recruiting input');
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
        case 'n':
          this.sortCol('lname');
          break;
        case 'p':
          this.sortCol('pos');
          break;
        case 'h':
          this.sortCol('hs');
          break;
        case 'H':
          this.sortCol('state')
          break;
        case 'r':
          this.sortCol('rivalsStars');
          break;
        case 'R':
          this.sortCol('rivalsRank');
          break;
        case 's':
          this.sortCol('scoutStars');
          break;
        case 'S':
          this.sortCol('scoutRank');
          break;
      }
    }
  };

  onChange = (e) => {
    if (e && e.target.value) {
      this.changeYear(parseInt(e.target.value));
    }
  };

  changeYear = (year) => {
    this.setState({ year });
    this.getRecruits(year);
  };

  getRecruits = (year) => {
    let recruits = LocalStorageService.get(`rec-${year}`);
    if (recruits) {
      this.setState({ recruits: recruits });
    }

    Rest.get(`recruits/${year}`).then(res => {
      this.setState({ recruits: res });
      if (JSON.stringify(res) !== JSON.stringify(recruits)) {
        LocalStorageService.set(`rec-${year}`, res);
      }
    });
  };

  sortCol = (field) => {
    let col = this.columns.find(c => c.field === field);
    if (col) {
      let currentSortField = this.state.sortCol;
      if (currentSortField === col.field) {
        // We are just re-sorting the already chosed column
        this.setState({ sortAsc: !this.state.sortAsc });
      } else {
        this.setState({ sortCol: col.field });
      }
    }
  };

  next = () => {
    let year = this.state.year + 1;
    if (year <= this.currentYear + 2) {
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
    let headers = [];
    let year = this.state.year;
    let map;
    let sortCol = this.state.sortCol || 'lname';
    let recruits = this.state.recruits;

    recruits.sort((a, b) => {
      if (!a[sortCol] || !b[sortCol]) {
        return 0;
      }

      if (typeof a[sortCol] === 'string') {
        let nameA = a[sortCol].toUpperCase();
        let nameB = b[sortCol].toUpperCase();
        if (nameA < nameB) {
          return this.state.sortAsc ? -1 : 1;
        }
        if (nameA > nameB) {
          return this.state.sortAsc ? 1 : -1;
        }
        return 0;
      }

      if (typeof a[sortCol] === 'number') {
        return this.state.sortAsc ? (a[sortCol] - b[sortCol]) : (b[sortCol] - a[sortCol]);
      }

      return 0;
    });

    rows = this.state.recruits.map(rec => {
      return (
        <tr>
          <td>{`${rec.fname} ${rec.lname}`}</td>
          <td>{rec.pos}</td>
          <td>{`${rec.city}, ${rec.state}`}</td>
          <td class="larger">{rec.hs}</td>
          <td class="larger center">{`${rec.rivalsStars} ★`}</td>
          <td class="larger center">{`${rec.scoutStars} ★`}</td>
          <td class="larger center">{rec.rivalsRank}</td>
          <td class="larger center">{rec.scoutRank}</td>
          <td class="smaller center">{`${rec.avgStars} ★`}</td>
          <td class="smaller center">{rec.avgRank}</td>
        </tr>
      );
    });

    headers = this.columns.map(col => {
      let arrow;
      let className = col.field;

      if (col.center) {
        className += ' center';
      }

      if (col.hideSmall) {
        className += ' larger';
      }
      else if (col.hideLarge) {
        className += ' smaller';
      }

      if (this.state.sortCol === col.field) {
        className += ' sort';
        className += (this.state.sortAsc ? 'asc' : 'desc');

        arrow = this.state.sortAsc ? <span class="sort-arrow">▲</span> : <span class="sort-arrow">▼</span>;
      }

      return (<th class={className} onClick={() => self.sortCol(col.field)}>{col.name}{arrow}</th>);
    });

    table = (
      <table class="recruits-table">
        <thead>
          { headers }
        </thead>
        <tbody>
          { rows }
        </tbody>
      </table>
    );

    if (this.maps[year]) {
      map = (
        <div class="align-center full-width">
          <iframe src={this.maps[year]}></iframe>
          <br />
          <small>View <a href={this.maps[year]} target="_blank">{ year } { this.props.config.team } Football Commitments</a> in a larger map</small>
        </div>
      );
    }

    return (
      <div class="main recruiting">
        <h1>{ this.props.config.team } Football Recruiting</h1>
        <select class="big-select margin-bottom-1rem" onChange={this.onChange}>
          {
            this.years.map(y => <option value={y} selected={y === this.state.year}>{y}</option>)
          }
        </select>
        { table }
        { map }
      </div>
    );
  }
}
