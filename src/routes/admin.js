import { h, Component } from 'preact';
import { route } from 'preact-router';
import Rest from '../lib/rest-service';
import LocalStorageService from '../lib/local-storage-service';
import DepthChart from '../components/depthChart';
import EditablePlayerSlideOut from '../components/editablePlayerSlideOut';
import InactivePlayersTable from '../components/inactivePlayersTable';
import Expandable from '../components/expandable';
import EditableTable from '../components/editableTable';
import CSSTransitionGroup from 'preact-css-transition-group';

export default class Admin extends Component {
  constructor(props) {
    super(props);
    if (!props.user) {
      route('/');
    }
    this.refreshCallback = null;
    this.positions = ['QB', 'RB', 'FB', 'TE', 'WR', 'OL', 'DE', 'DT', 'LB', 'CB', 'S', 'K', 'P'];
    this.truePositions = [
      'QB', 'RB', 'FB', 'TE', 'WR2', 'WR9', 'Slot', 'LT', 'LG', 'C', 'RG', 'RT',
      'WDE', 'SDE', 'NG', 'DT', 'WLB', 'MLB', 'SLB', 'LCB', 'RCB', 'FS', 'SS', 'K', 'P'
    ];
    this.states = [
      'AK', 'AL', 'AR', 'AS', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'GU',
      'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN',
      'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK',
      'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VI', 'VT', 'WA',
      'WI', 'WV', 'WY'
    ];
    this.recTableHeaders = [
      { title: 'First', name: 'fname', type: 'text'},
      { title: 'Last', name: 'lname', type: 'text'},
      { name: 'pos', type: 'select', options: this.positions},
      { name: 'truePos', title: 'Sub-Pos', type: 'select', options: this.truePositions},
      { name: 'city', type: 'text'},
      { name: 'state', type: 'select', options: this.states},
      { title: 'HS', name: 'hs', type: 'text'},
      { name: 'height', type: 'text'},
      { name: 'weight', type: 'number'},
      { title: 'R Rank', name: 'rivalsRank', type: 'number'},
      { title: 'R *', name: 'rivalsStars', type: 'number'},
      { title: 'S Rank', name: 'scoutRank', type: 'number'},
      { title: 'S *', name: 'scoutStars', type: 'number'},
      { title: 'Early?', name: 'earlyEnrollee', type: 'boolean'}
    ];
    let d = new Date();
    this.currentRecYear = d.getMonth() < 2 ? d.getFullYear() : d.getFullYear() + 1;
    this.currentYear = d.getFullYear();
    this.years = [];
    for (let i = this.currentYear + 2; i >= this.props.config.firstSeason; i--) {
      this.years.push(i);
    }
    this.recYears = [];
    for (let i = this.currentRecYear + 2; i >= this.props.config.firstTrackedRecruitingSeason; i--) {
      this.recYears.push(i);
    }
    this.state = {
      players: {},
      recruits: [],
      games: [],
      playerSlideOut: null,
      scheduleYear: this.currentYear,
      recYear: this.currentRecYear,
      opponentOptions: [],
      locationOptions: [],
      gameTableHeaders: [],
      confirmAction: null,
      confirmModal: false,
      confirmText: null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.user) {
      route('/');
    }
  }

  componentDidMount() {
    this.getPlayers();
    this.getGames(this.currentYear);
    this.getRecruits(this.currentRecYear);
    Rest.get('conferences').then(conferences => {
      this.conferences = conferences;
    });

    Promise.all([
      Rest.get('locations'),
      Rest.get('opponents')
    ]).then(([ locationOptions, opponentOptions ]) => {
      let gameTableHeaders = [
        { name: 'game', type: 'text' },
        { name: 'date', type: 'date' },
        {
          name: 'opponent',
          type: 'autocomplete',
          items: opponentOptions.map(o => o.name),
          render: (items) => {
            return items.map(item => {
              let classes = item.highlighted ? 'option highlighted' : 'option';
              return (
                <li class={ classes } onClick={this.onClick} data-item={item}>
                  <div class={`team-logo logo-${ item.val.replace(/\s+/g, '').replace(/&/g, '').replace(/\./g, '') }`}></div>
                  {item.val}
                </li>
              );
            });
          }
        },
        { name: 'teamScore', title: 'Team Score', type: 'number' },
        { name: 'opScore', title: 'Opponent Score', type: 'number' },
        {
          name: 'location',
          type: 'autocomplete',
          items: locationOptions,
          render: (items) => {
            return items.map(item => {
              let classes = item.highlighted ? 'option highlighted' : 'option';
              return (
                <li class={ classes } onClick={this.onClick} data-item={item}>
                  {item.val}
                </li>
              );
            });
          }
        }
      ];

      this.setState({ opponentOptions, locationOptions, gameTableHeaders });
    });
  }

  getPlayers = () => {
    let players = LocalStorageService.get('players');
    if (players) {
      this.setState({ players });
    }

    Rest.get('playersByPos').then(pls => {
      if (JSON.stringify(pls) !== JSON.stringify(players)) {
        this.setState({ players: pls });
        if (this.refreshCallback) {
          this.refreshCallback();
        }
      }
    });
  };

  getGames = (year) => {
    Rest.get(`year/${year}`).then(res => {
      this.setState({ games: res });
    });
  };

  getRecruits = (year) => {
    Rest.get(`recruits/${year}`).then(res => {
      this.setState({ recruits: res });
    });
  };

  showPlayerSlideOut = (player) => {
    this.setState({ playerSlideOut: player });
  };

  dismissPlayerSlideOut = () => {
    this.setState({ playerSlideOut: null });
  };

  savePlayer = (player) => {
    Rest.post(`player/${player._id}`, player).then(() => {
      this.getPlayers();
      this.dismissPlayerSlideOut();
    });
  };

  swapPlayers = (player, replacedPlayer, insertFirst, insertLast) => {
    Rest.post('posChange', { player, replacedPlayer, insertFirst, insertLast }).then(() => {
      this.getPlayers();
    }).catch(e => {
      console.error(e);
    });
  };

  registerRefreshCallback = (cb) => {
    this.refreshCallback = cb;
  };

  saveGameRow = (game) => {
    // We first have to correctly set the conference info, etc.
    let conf = this.conferences.find(c => c.members.indexOf(game.opponent) !== -1);
    if (conf) {
      game.conference = conf.conference;
      game.currentConf = conf.conference;
      game.majorConf = conf.majorConf;
      game.fbs = conf.fbs;
      game.fcs = conf.fcs;
      game.confGame = conf.conference.indexOf(this.props.config.conference) !== -1;
    }
    Rest.post('games', game).catch(e => {
      console.error(e);
    });
  };

  saveRecRow = (rec, i) => {
    Rest.post('recruits', rec).then(recruit => {
      let recruits = this.state.recruits;
      recruits[i] = recruit;
      this.setState({ recruits });
    }).catch(e => {
      console.error(e);
    });
  };

  setScheduleYear = (e) => {
    let year = parseInt(e.target.value);
    this.setState({ scheduleYear: year });
    this.getGames(year);
  };

  setRecruitsYear = (e) => {
    let year = parseInt(e.target.value);
    this.setState({ recYear: year });
    this.getRecruits(year);
  };

  addRecruit = () => {
    let protoRecruit = {
      fname: 'John',
      lname: 'Doe',
      pos: 'QB',
      truePos: 'QB',
      class: this.state.recYear,
      city: this.props.config.city.slice(0, -4),
      state: this.props.config.city.slice(-2),
      hs: this.props.config.city.slice(0, -4),
      height: '6-2',
      weight: 200,
      rivalsRank: 25,
      scoutRank: 25,
      rivalsStars: 4,
      scoutStars: 4,
      earlyEnrollee: false
    };
    let recruits = this.state.recruits;
    recruits.push(protoRecruit);
    this.setState({ recruits });
  };

  addGame = () => {
    let games = this.state.games;
    let lastGame = this.state.games[this.state.games.length - 1];
    let newDate;

    if (lastGame) {
      newDate = new Date(lastGame.date);
      newDate.setDate(newDate.getDate() + 7);
      while (newDate.getDay() !== 6) {
        newDate.setDate(newDate.getDate() + 1);
      }
    }
    else {
      // We must be adding the first game of the season!
      // Let's make a reasonable guess here, starting at the first
      // Saturday on or after August 30th
      newDate = new Date();
      newDate.setFullYear(this.state.scheduleYear);
      newDate.setMonth(7);
      newDate.setDate(30);
      while (newDate.getDay() !== 6) {
        newDate.setDate(newDate.getDate() + 1);
      }
    }

    let day = newDate.getDate();
    if (day.toString().length === 1) {
      day = `0${day}`;
    }
    let month = newDate.getMonth() + 1;
    if (month.toString().length === 1) {
      month = `0${month}`;
    }

    let protoGame = {
      season: this.state.scheduleYear,
      opponent: this.state.opponentOptions[0].name,
      game: lastGame ? lastGame.game + 1 : 1,
      result: 'T',
      date: `${newDate.getFullYear()}-${month}-${day}`,
      homeAwayNeutral: 'H',
      location: this.props.config.city,
      teamScore: 0,
      opScore: 0,
      conference: this.props.config.conference,
      gameId: lastGame ? lastGame.gameId + 1 : null
    };

    delete protoGame._id;
    delete protoGame.__v;
    games.push(protoGame);
    this.setState({ games });
  };

  deleteGameRow = (i, deletedGame) => {
    Rest.del(`games/${deletedGame._id}`, deletedGame).then(() => {
      this.getGames(this.state.scheduleYear);
    }).catch(e => {
      console.error(e);
    });
  };

  deleteRecRow = (i, deletedRecruit) => {
    Rest.del(`recruit/${deletedRecruit._id}`, deletedRecruit).then(() => {
      this.getRecruits(this.currentRecYear);
    }).catch(e => {
      console.error(e);
    });
  };

  maybePerformAction = (action, confirmText) => {
    let confirmAction = this[action];
    this.setState({ confirmModal: true, confirmAction, confirmText });
  };

  dismissConfirmModal = () => {
    this.setState({ confirmModal: false, confirmAction: null, confirmText: null });
  };

  advancePlayers = () => {
    Rest.post('advancePlayers').then(() => {
      this.getPlayers();
      this.dismissConfirmModal();
    });
  };

  enrollEarly = () => {
    Rest.post('recruits/enroll?early=true').then(() => {
      this.getPlayers();
      this.getRecruits();
      this.dismissConfirmModal();
    });
  };

  enrollAll = () => {
    Rest.post('recruits/enroll').then(() => {
      this.getPlayers();
      this.getRecruits();
      this.dismissConfirmModal();
    });
  };

  fixStringNumbers = () => {
    Rest.post('fixStringNumbers').then(() => {
      this.getPlayers();
      this.dismissConfirmModal();
    });
  };

  render() {
    let depth, playerSlideOut;
    let confirmModal = [];

    if (this.state.players && this.state.playerSlideOut) {
      playerSlideOut = <EditablePlayerSlideOut player={this.state.playerSlideOut} dismiss={this.dismissPlayerSlideOut} save={(player) => this.savePlayer(player)} />;
    }

    if (this.state.confirmModal && typeof this.state.confirmAction === 'function') {
      confirmModal = (
        <div>
          <div class="modal-backdrop"></div>
          <div class="modal scale-in confirm-modal">
            <div class="modal-header">
              <h2>Are you sure you want to {this.state.confirmText}?</h2>
              <button class="dismiss-btn" onClick={() => this.dismissConfirmModal()}>&times;</button>
            </div>
            <div class="modal-body flex">
              <div class="btn-container">
                <button class="btn primary" onClick={() => this.state.confirmAction()}>Yes</button>
                <button class="btn" onClick={() => this.dismissConfirmModal()}>No</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div class="main admin">
        <h1>Admin</h1>

        <CSSTransitionGroup
          transitionName="slide-out"
          transitionAppear={true}
            transitionLeave={true}
          transitionEnter={true}
          transitionEnterTimeout={0}
          transitionLeaveTimeout={0}>
          {playerSlideOut || []}
        </CSSTransitionGroup>

        <Expandable title="Edit Depth Chart" defaultCollapsed>
          <DepthChart
            selectedCallback={(player) => this.showPlayerSlideOut(player)}
            players={this.state.players}
            swapPlayers={this.swapPlayers}
            editable
          />
        </Expandable>

        <hr />

        <Expandable title="Inactive Players" defaultCollapsed>
          <InactivePlayersTable
            playerReactivated={() => this.getPlayers()}
            registerForRefresh={cb => this.registerRefreshCallback(cb)}
          />
        </Expandable>

        <hr />

        <Expandable class="flex-center" title="Edit Schedule" defaultCollapsed>
          <select onChange={this.setScheduleYear}>
            {
              this.years.map(y => {
                return <option value={y} selected={y === this.state.scheduleYear}>{y}</option>
              })
            }
          </select>
          <EditableTable
            class="capped-size-table"
            headers={this.state.gameTableHeaders}
            data={this.state.games || []}
            autoSaveRow={true}
            rowSaveCallback={this.saveGameRow}
            rowDeleteCallback={this.deleteGameRow}
            deleteButton
          />
          <button class="btn primary" onClick={this.addGame}>Add Game</button>
        </Expandable>

        <hr />

        <Expandable class="flex-center" title="Edit Recruits" defaultCollapsed>
          <select onChange={this.setRecruitsYear}>
            {
              this.recYears.map(y => {
                return <option value={y} selected={y === this.state.recYear}>{y}</option>
              })
            }
          </select>
          <EditableTable
            headers={this.recTableHeaders}
            data={this.state.recruits || []}
            autoSaveRow={true}
            rowSaveCallback={this.saveRecRow}
            rowDeleteCallback={this.deleteRecRow}
            deleteButton
          />
          <button class="btn primary" onClick={this.addRecruit}>Add Recruit</button>
        </Expandable>

        <hr />

        <Expandable title="One-Click Actions" defaultCollapsed>
          <h2>Fix string numbers</h2>
          <button class="btn primary" onClick={() => this.maybePerformAction('fixStringNumbers', 'Fix String Numbers')}>Fix</button>
          <h2>Advance Players</h2>
          <button class="btn primary" onClick={() => this.maybePerformAction('advancePlayers', 'Advance Players')}>Advance</button>
          <h2>Enroll Early Recruits</h2>
          <button class="btn primary" onClick={() => this.maybePerformAction('enrollEarly', 'Enroll all early recruits')}>Enroll</button>
          <h2>Enroll All Recruits</h2>
          <button class="btn primary" onClick={() => this.maybePerformAction('enrollAll', 'Enroll all recruits')}>Enroll</button>
        </Expandable>

        <CSSTransitionGroup
          class="full-width"
          transitionName="modal-pop-in"
          transitionAppear={true}
            transitionLeave={true}
          transitionEnter={true}
          transitionEnterTimeout={150}
          transitionLeaveTimeout={150}>
          { confirmModal }
        </CSSTransitionGroup>
      </div>
    );
  }
}
