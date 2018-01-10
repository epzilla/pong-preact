import { h, Component } from 'preact';
import Rest from '../lib/rest-service';
import LocalStorageService from '../lib/local-storage-service';
import StatsTable from '../components/statsTable';
import Expandable from '../components/expandable';
import SegmentedControl from '../components/segmentedControl';
import Toggle from '../components/toggle';
import CSSTransitionGroup from 'preact-css-transition-group';

export default class Stats extends Component {
  constructor(props) {
    super(props);
    this.years = [];
    this.reverseYears = [];
    this.currentYear = new Date().getFullYear();
    this.conferences = LocalStorageService.get('conferences') || [];
    this.originalState = {
      selectedTeams: [],
      showSelectTeams: false,
      options: this.conferences.length > 0 ? this.buildOptions(this.conferences) : [],
      startYear: this.props.config.firstSeason,
      endYear: this.currentYear,
      games: [],
      homeAwayNeutral: undefined,
      minTeamScore: 20,
      minOppScore: 20,
      maxTeamScore: 20,
      maxOppScore: 20,
      teamSearch: null,
      minTeamScoreEnabled: false,
      minOppScoreEnabled: false,
      maxTeamScoreEnabled: false,
      maxOppScoreEnabled: false,
      submitted: false
    };
    this.state = Object.assign({}, this.originalState);

    for (let i = this.currentYear; i >= this.props.config.firstSeason; i--) {
      this.reverseYears.push(i);
      this.years.unshift(i);
    }
  }

  componentDidMount() {
    Rest.get('conferences').then(conferences => {
      if (JSON.stringify(conferences) !== JSON.stringify(this.conferences)) {
        this.setState({ options: this.buildOptions(conferences) });
        LocalStorageService.set('conferences', conferences);
      }
    });

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
    else if ((e.shiftKey || e.target.nodeName !== 'INPUT')) {
      if (e.key === 'Enter') {
        let btn = document.querySelector('.main.stats .btn.big');
        if (btn) {
          e.preventDefault();
          e.stopPropagation();
          btn.click();
        }
      }
    }
  };

  onKeyUp = (e) => {
    if (e.target.nodeName !== 'INPUT') {
      switch (e.key) {
        case '/':
          let input = document.querySelector('.main.stats input');
          if (input) {
            input.focus();
          }
          break;
        case 'r':
          this.reset();
          break;
      }
    }
  };

  buildOptions = (confs) => {
    let opts = {
      conferenceTeams: [],
      conferences: [],
      currentMembers: [],
      defunct: [
        { value: 'Conf: Big East', label: 'Big East' },
        { value: 'Conf: Big 8', label: 'Big 8' },
        { value: 'Conf: Big West', label: 'Big West' },
        { value: 'Conf: Border', label: 'Border Conference' },
        { value: 'Conf: Gulf States', label: 'Gulf States Conference' },
        { value: 'Conf: Metro', label: 'Metro Conference' },
        { value: 'Conf: MVC', label: 'Missouri Valley Conference' },
        { value: 'Conf: SIAA', label: 'SIAA' },
        { value: 'Conf: Southern', label: 'Southern Conference' },
        { value: 'Conf: SWC', label: 'SWC' },
        { value: 'Conf: WAC', label: 'WAC' }
      ]
    }

    confs.forEach(c => {
      opts.conferenceTeams.push({
        label: c.conference,
        options: c.members.map(m => { return { label: m, value: m } })
      });
      opts.currentMembers.push({ value: `Current ${c.conference}`, label: `Current ${c.conference}` });
      opts.conferences.push({ value: `Conf: ${c.conference}`, label: c.conference });
    });

    return opts;
  };

  onStartYearChange = (e) => {
    this.setState({ startYear: parseInt(e.target.value) });
  };

  onEndYearChange = (e) => {
    this.setState({ endYear: parseInt(e.target.value) });
  };

  onTeamSearchChange = (e) => {
    this.setState({ teamSearch: e.target.value });
  };

  toggleTeam = (t) => {
    let selectedTeams = this.state.selectedTeams;
    let i = selectedTeams.indexOf(t);
    if (i === -1) {
      selectedTeams.push(t);
    }
    else {
      selectedTeams.splice(i, 1);
    }
    this.setState({ selectedTeams });
  };

  toggleGroup = (e) => {
    let unchecked = e.target.parentElement.querySelectorAll('input[type=checkbox]:not(:checked)');
    if (unchecked.length > 0) {
      Array.from(unchecked).forEach(item => item.click());
    }
    else {
      Array.from(e.target.parentElement.querySelectorAll('input[type=checkbox]')).forEach(item => item.click());
    }
  };

  toggleAttend = (id) => {
    Rest.post(`updateAttendance/${id}`).then(() => {
      this.props.toggleUserAttend(id);
    });
  };

  reset = () => {
    this.setState({
      showSelectTeams: false,
      games: [],
      submitted: false
    });
  };

  openSelectTeams = () => {
    this.setState({ showSelectTeams: true });
  };

  closeSelectTeams = () => {
    this.setState({ showSelectTeams: false });
  };

  submit = (e) => {
    e.preventDefault();
    let startYear = this.state.startYear;
    let endYear = this.state.endYear;
    let teams = [];
    let confs = [];
    let curr = [];
    let homeAwayNeutral = this.state.homeAwayNeutral;

    for (let i = 0; i < this.state.selectedTeams.length; i++) {
      let team = this.state.selectedTeams[i];

      if (team.indexOf('Conf: ') !== -1) {
        confs.push(team.replace('Conf: ', ''));
      } else if (team.indexOf('Current ') !== -1) {
        curr.push(team.replace('Current ', ''));
      } else {
        teams.push(team);
        if (team === 'ALL-OPP') {
          confs = [];
          curr = [];
          break;
        }
      }
    }

    let query = { startYear, endYear, teams, confs, curr };
    ['minTeamScore', 'maxTeamScore', 'minOppScore', 'maxOppScore'].forEach(field => {
      if (this.state[`${field}Enabled`]) {
        query[field] = this.state[field];
      }
    })

    if (this.state.homeAwayNeutral) {
      query.homeAwayNeutral = this.state.homeAwayNeutral;
    }

    Rest.post('statsByopponent', query).then(games => {
      this.setState({ games, submitted: true }, () => {
        requestAnimationFrame(() => {
          let el = document.querySelector('hr');
          if (el) {
            el.scrollIntoView(true);
          }
        });
      });
    });
  };

  onHANChange = (homeAwayNeutral) => {
    let han = this.state.homeAwayNeutral;
    if (homeAwayNeutral === han) {
      this.setState({ homeAwayNeutral: undefined });
    }
    else {
      this.setState({ homeAwayNeutral });
    }
  };

  toggleMinMaxScore = (field) => {
    let obj = this.state;
    obj[`${field}Enabled`] = !obj[`${field}Enabled`];
    this.setState(obj);
  };

  onMinMaxScoreChange = (e, field) => {
    let obj = this.state;
    obj[field] = e.target.value;
    this.setState(obj);
  };

  render() {
    let classes = this.state.submitted ? 'main stats submitted' : 'main stats';
    let submittedSection = [];
    let selectTeamsModal = [];

    if (this.state.submitted) {
      submittedSection = (
        <div class="show-submitted full-width">
          <h3 class="no-margin-top color-primary">vs.</h3>
          <h2 class="color-primary">{this.state.selectedTeams.join(', ')}</h2>
          <h3 class="align-center no-margin-top color-tertiary">{`${this.state.startYear} – ${this.state.endYear}`}</h3>
          <div class="form-group flex-col">
            <button class="btn big center" onClick={() => this.reset()}>Back</button>
          </div>
          { this.state.games.length > 0 ? <hr /> : null }
          { this.state.games.length > 0 ?
            <StatsTable
              games={this.state.games}
              user={this.props.user}
              currentYear={this.currentYear}
              config={this.props.config}
              toggleUserAttend={this.toggleAttend}
              showRecord={true}
            /> : <h2 class="align-center">No results Found 😞</h2>
          }
        </div>
      );
    }

    if (this.state.showSelectTeams) {
      let lowerSearch = this.state.teamSearch ? this.state.teamSearch.toLowerCase() : null;
      let conferences = this.state.options.conferenceTeams.map(c => {
        let options = c.options.filter(opt => opt.label.toLowerCase() !== this.props.config.team.toLowerCase() && (!lowerSearch || opt.label.toLowerCase().indexOf(lowerSearch) !== -1))
          .map(opt => {
            return (
              <li class="item">
                <input type="checkbox" checked={this.state.selectedTeams.indexOf(opt.value) !== -1} id={`team-${opt.value}`} onClick={() => this.toggleTeam(opt.value)} />
                <label for={`team-${opt.value}`}>
                  <div class={`team-logo logo-${ opt.value.replace(/\s+/g, '').replace(/&/g, '').replace(/\./g, '') }`}></div>
                  <span>{ opt.label }</span>
                </label>
              </li>
            );
        });

        if (options.length > 0) {
          return (
            <ul class="group">
              <li class="item header" onClick={(e) => this.toggleGroup(e)}>{c.label}</li>
              { options }
            </ul>
          );
        }
      });

      let conferenceOptions = this.state.options.conferences.filter(opt => !lowerSearch || opt.label.toLowerCase().indexOf(lowerSearch) !== -1)
        .map(opt => {
          return (
            <li class="item">
              <input type="checkbox" id={`conf-${opt.value}`} onClick={() => this.toggleTeam(opt.value)} />
              <label for={`conf-${opt.value}`}>{ opt.label }</label>
            </li>
          );
        });

      let currentOptions = this.state.options.conferences.filter(opt => !lowerSearch || opt.label.toLowerCase().indexOf(lowerSearch) !== -1)
        .map(opt => {
          return (
            <li class="item">
              <input type="checkbox" id={`conf-${opt.value}`} onClick={() => this.toggleTeam(opt.value)} />
              <label for={`conf-${opt.value}`}>{ opt.label }</label>
            </li>
          );
        });

      let defunctOptions = this.state.options.defunct.filter(opt => !lowerSearch || opt.label.toLowerCase().indexOf(lowerSearch) !== -1)
        .map(opt => {
          return (
            <li class="item">
              <input type="checkbox" id={`conf-${opt.value}`} onClick={() => this.toggleTeam(opt.value)} />
              <label for={`conf-${opt.value}`}>{ opt.label }</label>
            </li>
          );
        });

      let otherCategories = (
        <div class="lists">
          { conferenceOptions.length > 0 ?
            <ul class="group">
              <li class="item header">Conference (at time of game)</li>
              { conferenceOptions }
            </ul>
            : null
          }
          { currentOptions.length > 0 ?
            <ul class="group">
              <li class="item header">Conference (current)</li>
              { currentOptions }
            </ul>
            : null
          }
          { defunctOptions.length > 0 ?
            <ul class="group">
              <li class="item header">Defunct Conferences</li>
              { defunctOptions }
            </ul>
            : null
          }
          <ul class="group">
            <li class="item header">Other</li>
            <li class="item">
              <input type="checkbox" id="conf-ALL-OPP" onClick={() => this.toggleTeam('ALL-OPP')} />
              <label for="conf-ALL-OPP">All Opponents</label>
            </li>
            <li class="item">
              <input type="checkbox" id="conf-fcs" onClick={() => this.toggleTeam('Conf: FCS')} />
              <label for="conf-fcs">FCS</label>
            </li>
          </ul>
        </div>
      );

      selectTeamsModal = (
        <div key={1}>
          <div class="modal-backdrop"></div>
          <div class="modal scale-in select-teams">
            <div class="modal-header">
              <h2>Select Teams</h2>
              <div class="search-wrapper">
                <input type="search" autofocus value={this.state.teamSearch} onSearch={this.onTeamSearchChange} onKeyUp={this.onTeamSearchChange} />
              </div>
              <button class="dismiss-btn" onClick={this.closeSelectTeams}>&times;</button>
            </div>
            <div class="modal-body flex">
              <div class="flex-col">
                <div class="checklist">
                  <div class="set">
                    <div class="lists">{ conferences }</div>
                  </div>
                  <div class="set">
                    <h3 class="set-header">Other Categories</h3>
                    { otherCategories }
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer flex">
              <button class="btn big primary" onClick={this.closeSelectTeams}>Done</button>
            </div>
          </div>
        </div>
      );
    }

    let selectTeamBtn, selectedTeamNames;

    if (this.state.selectedTeams.length === 0) {
      selectTeamBtn = (
        <button class="btn big primary" onClick={this.openSelectTeams}>Select Team(s)</button>
      );
    }
    else {
      selectTeamBtn = (
        <button class="btn primary max-width-200" onClick={this.openSelectTeams}>Change Selected Teams</button>
      );

      selectedTeamNames = <h2 class="color-primary">{this.state.selectedTeams.join(', ')}</h2>;
    }

    return (
      <div class={ classes }>
        <div class="top-block">
          <h1>{ this.props.config.team } Football results</h1>
        </div>
        <div class="form-group flex-col hide-submitted flex-center">
          <label>Show me { this.props.config.team }&apos;s games against:</label>
          { selectedTeamNames }
          { selectTeamBtn }
        </div>
        <div class="form-group flex-col hide-submitted">
          <label>From</label>
          <select class="big-select margin-bottom-1rem" onChange={this.onStartYearChange}>
            {
              this.years.map(y => <option value={y} selected={y === this.state.startYear}>{y}</option>)
            }
          </select>
        </div>
        <div class="form-group flex-col hide-submitted">
          <label>To</label>
          <select class="big-select margin-bottom-1rem" onChange={this.onEndYearChange}>
            {
              this.reverseYears.map(y => <option value={y} selected={y === this.state.endYear}>{y}</option>)
            }
          </select>
        </div>
        <div class="hide-submitted margin-bottom-1rem">
          <Expandable title="Narrow it down more?..." defaultCollapsed small centered>
            <div class="more-options">
              <div class="form-group flex-col hide-submitted flex-center">
                <label>Game Locations:</label>
                <SegmentedControl
                  options={[
                    { label: 'Home', value: 'H'},
                    { label: 'Away', value: 'A'},
                    { label: 'Neutral', value: 'N'},
                  ]}
                  value={this.state.homeAwayNeutral}
                  onChange={(val) => this.onHANChange(val)}
                />
              </div>
              <hr />
              <div class="form-group flex-col hide-submitted">
                <ul class="criteria-list">
                  <li class="flex flex-align-center">
                    <Toggle id="enable-min-team-score" toggled={() => this.toggleMinMaxScore('minTeamScore')} onOff={this.state.minTeamScoreEnabled} property="minTeamScoreEnabled" />
                    <label class={!this.state.minTeamScoreEnabled ? 'disabled' : ''}>
                      When scoring at least <input type="number" value={this.state.minTeamScore} onChange={(e) => this.onMinMaxScoreChange(e, 'minTeamScore')} /> points
                    </label>
                  </li>
                  <li class="flex flex-align-center">
                    <Toggle id="enable-max-team-score" toggled={() => this.toggleMinMaxScore('maxTeamScore')} onOff={this.state.maxTeamScoreEnabled} property="maxTeamScoreEnabled" />
                    <label class={!this.state.maxTeamScoreEnabled ? 'disabled' : ''}>
                      When scoring fewer than <input type="number" value={this.state.maxTeamScore} onChange={(e) => this.onMinMaxScoreChange(e, 'maxTeamScore')} /> points
                    </label>
                  </li>
                  <li class="flex flex-align-center">
                    <Toggle id="enable-min-opp-score" toggled={() => this.toggleMinMaxScore('minOppScore')} onOff={this.state.minOppScoreEnabled} property="minOppScoreEnabled" />
                    <label class={!this.state.minOppScoreEnabled ? 'disabled' : ''}>
                      When opponent scores at least <input type="number" value={this.state.minOppScore} onChange={(e) => this.onMinMaxScoreChange(e, 'minOppScore')} /> points
                    </label>
                  </li>
                  <li class="flex flex-align-center">
                    <Toggle id="enable-max-opp-score" toggled={() => this.toggleMinMaxScore('maxOppScore')} onOff={this.state.maxOppScoreEnabled} property="maxOppScoreEnabled" />
                    <label class={!this.state.maxOppScoreEnabled ? 'disabled' : ''}>
                      When opponent scores fewer than <input type="number" value={this.state.maxOppScore} onChange={(e) => this.onMinMaxScoreChange(e, 'maxOppScore')} /> points
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </Expandable>
        </div>
        <div class="form-group flex-col hide-submitted">
          <button class="btn big primary" onClick={(e) => this.submit(e)}>Submit</button>
        </div>
        <CSSTransitionGroup
          class="full-width"
          transitionName="slide-up-half"
          transitionAppear={true}
            transitionLeave={true}
          transitionEnter={true}
          transitionEnterTimeout={0}
          transitionLeaveTimeout={0}>
          { submittedSection }
        </CSSTransitionGroup>
        <CSSTransitionGroup
          class="full-width"
          transitionName="modal-pop-in"
          transitionAppear={true}
            transitionLeave={true}
          transitionEnter={true}
          transitionEnterTimeout={150}
          transitionLeaveTimeout={150}>
          { selectTeamsModal }
        </CSSTransitionGroup>
      </div>
    );
  }
}
